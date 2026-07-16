import api from '@config/api';

export function request_fetchNotifications(data: any) {
  let { session, payload } = data;
  let { pageSize = 5, page = 1 } = payload;
  payload.pageSize = payload?.pageSize || 5;
  payload.page = payload?.page || 1;
  return api(session?.token, '')
    .get(`/users/${session?._id}/notifications?pageSize=${pageSize}&page=${page}`)
    .then((res: any) => {
      return {
        status: res?.status,
        data: res?.data,
      };
    })
    .catch((err: any) => {
      return {
        status: 'error',
        msg: err?.message,
      };
    });
};