const axios = require('axios').default;

module.exports = {
    async iran(endpoint) {
        try {
            const result = await axios.get(endpoint);

            return result.status == 200;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}