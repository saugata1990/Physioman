// could be moved to env

// keys for sms service
const twilio_sid = 'AC480864b7c349c72e265ebd93ae63bc7d' 
const twilio_token = 'daa74bf828fe597b69cf2ff71e95cd27'
const twilio_phone_number = '+15403616891'

// keys for email service to be added


// jwt keys
const patient_secret_key = 'jwtpatientsecretkey'
const admin_secret_key = 'jwtadminsecretkey'
const physio_secret_key = 'jwtphysiosecretkey'
const consultant_secret_key = 'jwtconsultantsecretkey'

// payumoney credentials
const merchant_key = 'EE9qCihR'
const merchant_salt = 'TXXa97puDk'
const auth_header = '4rPfEL6w/pPf3nCfEhCc8ogzf7SeOGVngIiGrWaav2g='

module.exports = {
    twilio_sid, 
    twilio_token, 
    twilio_phone_number, 
    patient_secret_key, 
    admin_secret_key, 
    physio_secret_key, 
    consultant_secret_key,
    merchant_key,
    merchant_salt,
    auth_header
}