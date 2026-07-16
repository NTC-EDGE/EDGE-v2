export default (state: any) => {
	return {
		_id: state?.user?.session?._id,
		token: state?.user?.session?.sessionToken,
	}
};