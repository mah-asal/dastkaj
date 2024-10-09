const axios = require('axios').default;


module.exports = async (ip = '') => {
    try {
        const result = await axios.post('https://api.ohmyapi.com/v1/call/api.v1.ip.lookup', {
            ip,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OHMYAPI_TOKEN}`
            },
        });

        return result.data['data']['country']['iso_code'];
    } catch (error) {
        console.error(error);
        return null;
    }
}