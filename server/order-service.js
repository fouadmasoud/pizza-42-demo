const ManagementClient = require("auth0").ManagementClient;

const management = new ManagementClient({
  domain: process.env.DOMAIN,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  scope: "read:users update:users",
});

const saveOrderHistory = async (orderInfo) => {
  try {
    const params = { id: orderInfo.user_id };
    // get the user's current user_metadata
    const user = await management.getUser(params);

    const currentOrder = {
      item_ordered: orderInfo.item_ordered,
      order_date: orderInfo.order_date,
    };

    var orderHistory = user.user_metadata?.order_history;
    if (orderHistory) {
      orderHistory.push(currentOrder);
    } else {
      orderHistory = [currentOrder];
    }

    const metadata = user.user_metadata || {};
    metadata.order_history = orderHistory;

    await management.updateUserMetadata(params, metadata);
  } catch (error) {
    throw error;
  }
};

const getOrderHistory = async (userId) => {
  try {
    const user = await management.getUser({ id: userId });
    var result = null;
    if (user && user.user_metadata && user.user_metadata.order_history) {
      result = user.user_metadata.order_history;
    }
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { saveOrderHistory, getOrderHistory };
