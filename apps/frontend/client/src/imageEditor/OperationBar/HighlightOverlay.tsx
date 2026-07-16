import * as React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import {
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
    State,
} from "react-native-gesture-handler";
import { useRecoilState, useRecoilValue } from "recoil";
import {highlightBrushState, highlightStrokesState, imageBoundsState} from "../Store";


const toPath = (pts: { x: number; y: number }[]) => {
    const len = pts.length;
    if (len === 0) return "";
    const parts = new Array(len);
    parts[0] = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < len; i++) {
        const p = pts[i];
        parts[i] = `L ${p.x} ${p.y}`;
    }
    return parts.join(" ");
};

const StrokeItem = React.memo(({ d, color, width }: { d: string; color: string; width: number }) => (
    <Path
        d={d}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
    />
));

export function HighlightOverlay() {
    const imageBounds = useRecoilValue(imageBoundsState);
    const [strokes, setStrokes] = useRecoilState(highlightStrokesState);
    const brush = useRecoilValue(highlightBrushState);

    // Track active stroke in local state to avoid global state churn.
    // We use a Ref for points to avoid stale closures in the gesture handlers,
    // and a state for the path string to trigger re-renders and show the active stroke.
    const [activePath, setActivePath] = React.useState<string>("");
    const pointsRef = React.useRef<{ x: number; y: number }[]>([]);
    // Use a Ref for the path string to build it incrementally (O(1) per move)
    const pathRef = React.useRef<string>("");

    const onGestureEvent = (e: PanGestureHandlerGestureEvent) => {
        const { x, y } = e.nativeEvent;
        const pts = pointsRef.current;

        // Skip point if it's too close to the last one (distance < 2px) to reduce string size and re-renders
        if (pts.length > 0) {
            const last = pts[pts.length - 1];
            const dx = x - last.x;
            const dy = y - last.y;
            if (dx * dx + dy * dy < 4) return;
        }

        pts.push({ x, y });

        // Incremental path building: O(1) string concatenation instead of O(N) array join
        if (pts.length === 1) {
            pathRef.current = `M ${x} ${y}`;
        } else {
            pathRef.current += ` L ${x} ${y}`;
        }

        setActivePath(pathRef.current);
    };

    const onStateChange = (e: PanGestureHandlerGestureEvent) => {
        const st = e.nativeEvent.state;

        if (st === State.BEGAN) {
            const { x, y } = e.nativeEvent;
            pointsRef.current = [{ x, y }];
            pathRef.current = `M ${x} ${y}`;
            setActivePath(pathRef.current);
        }

        if (st === State.END || st === State.CANCELLED || st === State.FAILED) {
            const pts = pointsRef.current;
            const finalPath = pathRef.current;
            if (pts.length > 0) {
                const id = `${Date.now()}-${Math.random()}`;
                // Commit to global state only once at the end of the gesture.
                // We include the pre-calculated path to avoid O(N^2) work in finalizedStrokes.
                setStrokes((prev) => [
                    ...prev,
                    { id, color: brush.color, width: brush.width, points: [...pts], path: finalPath },
                ]);
            }
            pointsRef.current = [];
            pathRef.current = "";
            setActivePath("");
        }
    };

    // Pre-calculated paths for finished strokes (thanks to memoized StrokeItem)
    const finalizedStrokes = React.useMemo(() => (
        strokes.map((s) => (
            <StrokeItem
                key={s.id}
                d={s.path || toPath(s.points)} // Prefer pre-calculated path string
                color={s.color}
                width={s.width}
            />
        ))
    ), [strokes]);

    return (
        <View
            pointerEvents="box-none"
            style={[
                styles.overlayWrap,
                {
                    left: imageBounds.x,
                    top: imageBounds.y,
                    width: imageBounds.width,
                    height: imageBounds.height,
                },
            ]}
        >
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onStateChange}
            >
                <View style={StyleSheet.absoluteFill}>
                    <Svg width="100%" height="100%">
                        {finalizedStrokes}
                        {activePath ? (
                            <Path
                                d={activePath}
                                stroke={brush.color}
                                strokeWidth={brush.width}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        ) : null}
                    </Svg>
                </View>
            </PanGestureHandler>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayWrap: {
        position: "absolute",
        // no background; it's just an overlay
    },
});
