import { changePassword } from '@/lib/actions/security-settings';

// Test the change password function
async function testChangePassword() {
  try {
    console.log('Testing change password...');
    
    // Create form data
    const formData = new FormData();
    formData.append('currentPassword', 'test123');
    formData.append('newPassword', 'newTest123');
    formData.append('confirmPassword', 'newTest123');
    
    const result = await changePassword(formData);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error testing change password:', error);
  }
}

testChangePassword();
