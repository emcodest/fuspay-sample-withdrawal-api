/**
* @desc Sample withdrawal integration on Fuspay exchanger API settings written in Nodejs
* @Author Emcode
*/
require("dotenv").config()
const hl = require("../../lib/Handler")
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// STEP #1
/** verify account number. API hosted by third party system */
this.NigeriaBankVerify = async (req, res) => {

    const { country, bank_code, account_number } = req.body
    //: expected request payload from fuspay exchanger system
    if (!country || !bank_code || !account_number) {
        return res.status(403).send("One or more field is missing")
    }

    //: make sure the right auth header is present
    const secret_key = req.headers["your-fuspay-secret-key"]
    if (!secret_key) {
        return res.sendStatus(401)
    }
    if (process.env.TEST_FUSPAY_SECRET_KEY === secret_key) {
        //todo: connect to a service or function to verify the bank_code and account number

        res.json({ verified: true })

    } else {
        res.json({ verified: false })
    }

}


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// STEP #2 AND // STEP #3
/** authorize transfer. API hosted by third party system */
this.NigeriaBankAuthorize = async (req, res) => {

    const { reference, amount, bank_details } = req.body
    //: expected request payload from fuspay exchanger system
    if (!reference || ! amount || ! bank_details) {
        return res.status(403).send("One or more field is missing")
    }
    if (isNaN(amount)) {
        return res.status(403).send("Amount should be number")
    }
    if (typeof bank_details != "object") {
        return res.status(403).send("Bank details should be object")
    }
    //: validate bank details model
    if (!("bank_code" in bank_details)) {
        return res.status(403).send("Bank code is required")
    }
    if (!("account_number" in bank_details)) {
        return res.status(403).send("Account number is required")
    }
    //: end validate bank details model

    //: make sure the right auth header is present
    const secret_key = req.headers["your-fuspay-secret-key"]
    if (!secret_key) {
        return res.sendStatus(401)
    }
    if (process.env.TEST_FUSPAY_SECRET_KEY === secret_key) {
        //! connect to fuspay to verify the transaction reference
        const fuspay_verification_url = "https://fuspay-wallet-staging.herokuapp.com/api/v1/no-auth/Payment/VerificationService?txn_reference=" + reference

        const verify_ref = await hl.MakeGetMore(fuspay_verification_url)

        if ("body" in verify_ref) {
            //: verified on fuspay
            //! reference verified
            if (verify_ref.status_code === 200) {
                if ("txn_reference" in verify_ref.body) {
                    //: if the amount in fuspay confirmation service is === to the amount sen for authorization
                    if (+verify_ref.body.amount === +amount) {

                        //todo: log the transfer reference  #1
                        //todo: make sure its processed once #2
                        //todo: make transfer to the user account #3  
                        return res.json({ code: "0000" })
                    }

                }
            }
        }

        res.status(403).json({ message: "Unable to make transfer" })

    } else {
        res.status(401).json({ message: "Unauthorized" })
    }

}
