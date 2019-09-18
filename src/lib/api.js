import axios from 'axios';

const outErr = err => ({ res: null, err });
const outRes = res => ({ res, err: null });

const post = async (data) => {
    try {
        const { res } = await axios.post('/post/data.json', data);
        if (res.err) throw res;
        outRes(res);
    } catch (err) {
        outErr(err);
    }
};

const get = async () => {
    try {
        const { data } = await axios.get('/get/data.json');
        if (data.err)  throw data;
        return outRes(data);
    } catch (err) {
        console.error(err);
        throw outErr(err);
    }
};

export {
    post, get,
};
