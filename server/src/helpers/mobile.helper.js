const formatMobileResponse = (data) => {
    // Format data specific to mobile clients
    return {
      success: true,
      payload: data,
    };
  };
  
  module.exports = { formatMobileResponse };
  