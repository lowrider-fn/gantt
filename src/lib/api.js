import axios from 'axios';

const outErr = err => ({ res: null, err });
const outRes = res => ({ res, err: null });

const baseUrl = process.env.NODE_ENV === 'production' ? '/gantt' : '';

const post = async (data) => {
    try {
        const { res } = await axios.post(`${baseUrl}/post/data.json`, data);
        if (res.err) throw res;
        outRes(res);
    } catch (err) {
        outErr(err);
    }
};

const get = async () => {
    try {
        const { data } = await axios.get(`${baseUrl}/get/data.json`);
        if (data.err) throw data;
        return outRes(data);
    } catch (err) {
        console.error(err);
        throw outErr(err);
    }
};

export {
    post, get,
};
