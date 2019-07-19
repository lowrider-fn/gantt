import axios          from 'axios';

const createRequest = async (requestData) => {
    const { payload } = requestData;
    const { data }    = payload
        ? await axios.post(requestData.url, payload)
        : await axios.get(requestData.url);
    return data;
};
export default createRequest;
