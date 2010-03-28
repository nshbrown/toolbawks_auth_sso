/*
 Copyright (c) 2007 Nathaniel Brown
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

Toolbawks.auth_sso.Hash = function(){
  return {
    build_login_key : function() {
      var _ = Toolbawks.auth_sso.Hash.get_form_element_values('login');

      Toolbawks.info('[tbx] Toolbawks.auth_sso.Hash -> properties (_)...');
      Toolbawks.dir(_);
      
      if (_ == false) {
        Toolbawks.error('[tbx] Toolbawks.auth_sso.Hash.build_login_key -> form values are empty');
        return false;
      }
      
      var raw_string = _.date + _.public_key + _.username + _.password + _.remember_me + _.secure_channel;

      var hex_func = 'hex_' + Toolbawks.auth_sso.TYPE;
    
      var hash_key = eval(hex_func + '("' + raw_string + '");');
      
      Toolbawks.info('Toolbawks.auth_sso.Hash.build_login_key -> hash_key : ' + hash_key);
      
      return hash_key;
    },

    build_logout_key : function() {
      var _ = Toolbawks.auth_sso.Hash.get_form_element_values('logout');

      if (_ == false) {
        Toolbawks.error('[tbx] Toolbawks.auth_sso.Hash.build_logout_key -> form values are empty');
        return false;
      }
      
      var raw_string = _.date + _.public_key + _.secure_channel;

      Toolbawks.log('Toolbawks.auth_sso.Hash.build_logout_key -> raw_string : ' + raw_string);

      var hex_func = 'hex_' + Toolbawks.auth_sso.TYPE;

      var hash_key = eval(hex_func + '("' + raw_string + '");');

      Toolbawks.log('Toolbawks.auth_sso.Hash.build_logout_key -> hash_key : ' + hash_key);

      return hash_key;
    },

    build_status_key : function() {
      var _ = Toolbawks.auth_sso.Hash.get_form_element_values('status');
      
      if (_ == false) {
        Toolbawks.error('[tbx] Toolbawks.auth_sso.Hash.build_status_key -> form values are empty');
        return false;
      }
      
      var raw_string = _.date + _.public_key + _.secure_channel;

      var hex_func = 'hex_' + Toolbawks.auth_sso.TYPE;
      
      var hash_key = eval(hex_func + '("' + raw_string + '");');
      
      Toolbawks.log('[tbx] Toolbawks.auth_sso.Hash.build_status_key -> hash_key : ' + hash_key);

      return hash_key;
    },
    
    get_form_element_values : function(partial) {
      if (!partial || partial == '' || partial == undefined) {
        partial = 'login';
        Toolbawks.warn('[tbx] Toolbawks.auth_sso.Hash.get_form_element_values -> no partial defined, setting to default "login"')
      }
      
      if (!$('toolbawks_auth_sso_' + partial + '_field_date')) {
        Toolbawks.error('[tbx] Toolbawks.auth_sso.Hash.get_form_element_values -> Unable to find form elements for : ' + partial);
        return false;
      }
      
      var _ = {
        date : $('toolbawks_auth_sso_' + partial + '_field_date').value,
        public_key : $('toolbawks_auth_sso_' + partial + '_field_public_key').value,
        secure_channel : $('toolbawks_auth_sso_' + partial + '_field_secure_channel').value,
      };
      
      if (partial == 'login') {
        _.remember_me = $('toolbawks_auth_sso_' + partial + '_field_remember_me').checked ? 'true' : 'false';
        _.username = $('toolbawks_auth_sso_' + partial + '_field_username').value;
        _.password = $('toolbawks_auth_sso_' + partial + '_field_password').value;
      }
      
      return _;
    },
    
    valid : function(hash) {
      return (hash && hash != '' && hash != undefined && hash != false);
    }
  };
}();