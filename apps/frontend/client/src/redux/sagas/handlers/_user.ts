export default (state: any) => {
	return state?.user?.session || state?.user?.sessionTemporary;
};