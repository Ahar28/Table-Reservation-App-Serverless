const AWS = require("aws-sdk");
AWS.config.update({
    region:'us-east-1'
})

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const resTab = 'restaurant_details'; 
exports.handler = async (event) => {
  try{
    const params = {
        TableName: resTab,
        Key: {
            'restaurant_id':event.params.querystring.restaurantId
        }
    };
    const data = await dynamoDB.get(params).promise();
    const availabilityData = data.Item.timings;
    return {
        statusCode:200,
        body:JSON.stringify(availabilityData)
    };
    } catch(error){
        return { error };
    }
};
