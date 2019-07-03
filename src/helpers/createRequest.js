import axios from 'axios';

const createRequest = async (requestData) =>  {
    if(requestData.payload)  {
        const {data} = await axios.post(requestData.url,requestData.payload);
        return data;
    }
    const {data} = await axios.get(requestData.url);
    return data;  
};
export default createRequest;