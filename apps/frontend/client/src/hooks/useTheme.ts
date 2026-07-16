import { RootStateOrAny, useSelector } from "react-redux";

const theme = () => {
  const {
    background,
    text,
    button,
    outline,
    roundness,
    thickness,
  } = useSelector((state:RootStateOrAny) => state.theme);

  return {
    background,
    text,
    button,
    outline,
    roundness,
    thickness,
  }
}

export default theme;