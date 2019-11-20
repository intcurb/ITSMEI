const getHeaders = async () => {
    const headers = {};
    const token = await localStorage.getItem('authorization');

    if (token !== null) {
        headers.Authorization = token;
    }
    return headers;
};

export default getHeaders;
