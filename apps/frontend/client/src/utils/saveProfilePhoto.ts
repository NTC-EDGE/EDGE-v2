// utils/profilePhoto.ts (or inside Settings file)
import { Platform } from 'react-native';
import { updateUser } from '@reducers/user/actions';

const isMobile = Platform.OS !== 'web';

export const saveProfilePhoto =
    (dispatch: any) =>
        async (picked: any, isCropped = false) => {
            if (!picked) return;

            const formData = new FormData();
            let fileObj: File | any;

            try {
                if (isMobile) {
                    // 👇 Native: assume Expo ImagePicker result
                    const asset = picked?.assets?.[0] ?? picked;

                    formData.append('profilePicture', {
                        uri: asset.uri,
                        name: asset.fileName || asset.name || 'photo.jpg',
                        type: asset.type || 'image/jpeg',
                    } as any);

                    dispatch(
                        updateUser({
                            userProfile: formData,
                            photo: true,
                            isCropped,
                        }),
                    );
                    return;
                }

                // 👇 Web
                // Case 1: We already got a File from <input type="file">
                if (picked instanceof File) {
                    fileObj = picked;
                }
                // Case 2: ImagePicker-like result in web (asset.uri is blob/data URL)
                else if (picked?.assets?.[0]) {
                    const asset = picked.assets[0];
                    const resp = await fetch(asset.uri);
                    const blob = await resp.blob();
                    const mimeType = blob.type || 'image/jpeg';
                    const ext = mimeType.split('/')[1] || 'jpeg';
                    const name = asset.fileName || asset.name || `photo.${ext}`;
                    fileObj = new File([blob], name, { type: mimeType });
                }
                // Case 3: plain { uri, name } object
                else if (picked?.uri) {
                    const resp = await fetch(picked.uri);
                    const blob = await resp.blob();
                    const mimeType = blob.type || 'image/jpeg';
                    const ext = mimeType.split('/')[1] || 'jpeg';
                    const name = picked.name || `photo.${ext}`;
                    fileObj = new File([blob], name, { type: mimeType });
                } else {
                    console.warn('Unsupported picked format:', picked);
                    return;
                }

                formData.append('profilePicture', fileObj);
                dispatch(
                    updateUser({
                        userProfile: formData,
                        photo: true,
                        isCropped,
                    }),
                );
            } catch (err) {
                console.warn('Error preparing upload:', err);
            }
        };
