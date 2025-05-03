const { aws } = require('../config');
const { PublishCommand } = require('@aws-sdk/client-sns');

class SnsService {
  static async sendSms(phoneNumber, message) {
    try {
      const params = new PublishCommand({
        Message: message,
        PhoneNumber: `+91${phoneNumber}`,
      });

      const response = await aws.snsClient.send(params);
      return { 
        success: true, 
        messageId: response.MessageId,
        message: "SMS sent successfully"
      };
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw new Error("Failed to send SMS");
    }
  }

  static async sendBulkSms(phoneNumbers, message) {
    try {
      const results = [];
      for (const phoneNumber of phoneNumbers) {
        const result = await this.sendSms(phoneNumber, message);
        results.push({
          phoneNumber,
          success: result.success,
          messageId: result.messageId
        });
      }
      return results;
    } catch (error) {
      console.error("Error sending bulk SMS:", error);
      throw new Error("Failed to send bulk SMS");
    }
  }

  static async sendOtp(phoneNumber, otp) {
    const message = `Your verification code is: ${otp}. Valid for 5 minutes.`;
    return this.sendSms(phoneNumber, message);
  }
}

module.exports = SnsService;