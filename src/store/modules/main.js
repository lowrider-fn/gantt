import createRequest from '@/helpers/createRequest';

const state   = {
    userData: null,
};
const actions = {

    getUserData({commit}, data) {
        return createRequest(data)
            .then(data => { 
                data.forEach(el => {
                    el.start = new Date(el.start);
                    el.end   = new Date(el.end);
                });
                commit('SET_USER_DATA',data);
                return data;
            })
            .catch(error => { throw error });
    }
};
const mutations = {

    SET_USER_DATA: (state, data) => state.userData = data

};
const  getters  = {

    userData: ({userData}) => userData,
};
export default {
    state,
    mutations,
    actions,
    getters
};