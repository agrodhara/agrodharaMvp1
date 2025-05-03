class DateUtils {
    static formatDateTime(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    }
  
    static formatDateForDisplay(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  
    static getCurrentDateTime() {
      return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
  
    static addMinutes(minutes) {
      const date = new Date();
      date.setMinutes(date.getMinutes() + minutes);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    }
  
    static isExpired(expiryDate) {
      return new Date(expiryDate) < new Date();
    }
  }
  
  module.exports = DateUtils;