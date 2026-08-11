require('dotenv').config({path: __dirname + '/../.env'});
const Razorpay = require('razorpay');
const r = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, 
    key_secret: process.env.RAZORPAY_KEY_SECRET
}); 

r.accounts.create({
    email: 'test@example.com', 
    phone: '9999999999', 
    type: 'route', 
    legal_business_name: 'Test', 
    business_type: 'partnership', 
    reference_id: 'org_' + Date.now(), 
    profile: {
        category: 'education', 
        subcategory: 'college', 
        addresses: {
            registered: {
                street1: 'Campus', 
                city: 'City', 
                state: 'State', 
                postal_code: '000000', 
                country: 'IN'
            }
        }
    }
}).then(console.log).catch(e => console.log('ERROR IS:', JSON.stringify(e, null, 2)));
