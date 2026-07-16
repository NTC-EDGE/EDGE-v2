import { RootStateOrAny, useSelector } from 'react-redux';
import { GUEST_USER } from '@utils/ntc';

const useGuest = () => {
  const user = useSelector((state: RootStateOrAny) => state?.user?.session);
  const isGuest = user?.email === GUEST_USER?.email || !user?.sessionToken;
  return isGuest;
}

export default useGuest;