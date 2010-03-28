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

Toolbawks.auth_sso.Login = function(){
  var retries = 0;
  var button_login = false;
  var _ = {
    cached_password : false,
    hooks : {
      success : [],
      failure : [],
      retry : [],
      timeout : []
    }
  };

  return {
    verify_hook_scope : function(scope) {
      switch (scope) {
        case 'success':
          return true;
        case 'failure':
          return true;
        case 'retry':
          return true;
        case 'timeout':
          return true;
        default:
          return false;
      }
    },
    
    add_hook : function(scope, func) {
      if (!Toolbawks.auth_sso.Login.verify_hook_scope(scope)) {
        Toolbawks.error('[tbx] Toolbawks.auth_sso.Login.add_hook : Hook failed to be added to scope [' + scope + ']. Hook details : ' + func);
        return false;
      }
      
      if (typeof func != 'undefined' && typeof func == 'function') {
        _.hooks[scope][_.hooks[scope].length] = func;
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.add_hook : Added hook to scope [' + scope + ']. Hook details : ' + func);
      } else {
        Toolbawks.error('[tbx] Toolbawks.auth_sso.Login.add_hook -> invalid hook being added to scope (' + scope + ')...');
      }
    },
    
    get_hooks : function(scope) {
      if (!Toolbawks.auth_sso.Login.verify_hook_scope(scope)) {
        Toolbawks.error('[tbx] Toolbawks.auth_sso.Login.get_hooks : Invalid scope while fetching hooks');
        return false;
      }
      return _.hooks[scope];
    },

    run_hooks : function(scope, json, pw) {
      Toolbawks.auth_sso.Login.get_hooks(scope).each(function(hook) {
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.run_hooks -> running ' + scope + ' hook...');
        if (typeof hook == 'function') {
          hook(json, pw);
        } else {
          Toolbawks.error('[tbx] Toolbawks.auth_sso.Login.run_hooks -> running ' + scope + ' hook...');
        }
      });
    },
    
    attach_button_login : function() {
      var button_id = 'button_toolbawks_auth_sso_login_popup';
      
      button_login = new Control.Modal(button_id, {
      	containerClassName: 'toolbawks_auth_sso_login_modal',
      	overlayClassName: 'toolbawks_auth_sso_login_modal_overlay',
      	width: $(button_id).readAttribute('width')
      });
    },
    
    get_button_login : function() {
      return button_login;
    },
    
    modal : function() {
      if (!Toolbawks.auth_sso.Login.get_button_login()) {
        Toolbawks.auth_sso.Login.attach_button_login();
      }
      
      button_login.open();
    },
    
    close : function() {
      if (!Toolbawks.auth_sso.Login.get_button_login()) {
        return false;
      } else {
        button_login.close();
      }
    },
    
    now : function(local) {
      if (!local || local == undefined || local == '') {
        local = false;
      }
      
      Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.now');
      
      var field_password = $('toolbawks_auth_sso_login_field_password');
      var field_hash = $('toolbawks_auth_sso_login_field_hash');
      
      if (field_password && field_password.value != '') {
        Toolbawks.auth_sso.Details.set_cached_password(field_password.value);
      }
      
      var cached_password = Toolbawks.auth_sso.Details.get_cached_password();
      
      Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.now -> cached_password : ' + cached_password);

      if (field_password.value == '' && cached_password && cached_password != false && cached_password.length > 0) {
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.now -> setting password field with cached password');
        $('toolbawks_auth_sso_login_field_password').value = cached_password;
      }

      var hash = Toolbawks.auth_sso.Hash.build_login_key();
      var _ = Toolbawks.auth_sso.Hash.get_form_element_values('logout');

      if (!Toolbawks.auth_sso.Hash.valid(hash)) {
        Toolbawks.error('[tbx] Toolbawks.auth_sso.Login.now -> hash not defined');
        return false;
      } else if (_ == false) {
        Toolbawks.warn('[tbx] Toolbawks.auth_sso.Login.now -> form values are empty -> unable to grab password if a timeout/retry is required');
      }

      field_hash.value = hash;
      field_password.value = '';
      
      return Toolbawks.auth_sso.Login.submit(local);
    },
    
    submit : function(local) {
      
      var url = (!local && Toolbawks.auth_sso.DOMAIN ? Toolbawks.auth_sso.DOMAIN : '') + Toolbawks.auth_sso.PATH_CONTROLLER + '/login';
      var params = Form.serialize($('toolbawks_auth_sso_login'), true);
      local = Toolbawks.util.QueryString.local(url) ? true : local;
      
      if (local) {
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.submit -> local request');
        params['toolbawks_auth_sso_login[local]'] = "true";
      }

      params['toolbawks_auth_sso_login[remember_me]'] = Toolbawks.auth_sso.Hash.get_form_element_values().remember_me;

      var method = 'GET';

      var responseSuccess = function(o) {
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.submit -> responseSuccess');

        if (o && o.responseText && !o.responseText.match(/transport_status/)) {
          // json not defined, convert from response text
          json = eval('(' + o.responseText + ')');
        }

        Toolbawks.info('[tbx] Toolbawks.auth_sso.Login.submit -> responseSuccess -> json..');
        Toolbawks.dir(json);
        
        try {
          $('toolbawks_auth_sso_login_message').update(json.message);
          Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.submit -> responseSuccess -> updated response message')
        } catch(e) {
          Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.submit -> responseSuccess -> missing message container')
        }

        Toolbawks.auth_sso.Login.check_if_success(json);
      };

      var responseFailure = function(o) {
        Toolbawks.error('[tbx] Toolbawks.auth_sso.Login.submit -> responseFailure');

        if (o && o.responseText && !o.responseText.match(/transport_status/)) {
          // json not defined, convert from response text
          json = eval('(' + o.responseText + ')');
        }

        Toolbawks.info('[tbx] Toolbawks.auth_sso.Login.submit -> responseFailure -> json..');
        Toolbawks.dir(json);

        Toolbawks.auth_sso.Login.check_if_success(json);
      };
      
      Toolbawks.info('[tbx] Toolbawks.auth_sso.Login.submit -> Logging into ' + url);
      
      new Ajax.Request(url, {
        method: method,
        crossSite: local ? false : true,
        onFailure: responseFailure,
        onSuccess: responseSuccess,
        parameters: params
      });
    },
    
    timeout : function(json) {
      if (json.timeout) {
        Toolbawks.auth_sso.Login.run_hooks('timeout', json);

        $('toolbawks_auth_sso_login_field_date').value = json.date;
        $('toolbawks_auth_sso_login_field_public_key').value = json.public_key;
        $('toolbawks_auth_sso_login_field_secure_channel').value = json.secure_channel;

        Toolbawks.auth_sso.Login.retry(json);
      }
    },
    
    retry : function(json) {
      if (json.retry == true && retries < Toolbawks.auth_sso.MAX_LOGIN_RETRY) {
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.timeout -> retry ' + retries + ' of ' + Toolbawks.auth_sso.MAX_LOGIN_RETRY)
        retries++;
        $('toolbawks_auth_sso_login_field_password').value = Toolbawks.auth_sso.Details.get_cached_password();

        Toolbawks.auth_sso.Login.run_hooks('retry', json);

        Toolbawks.auth_sso.Login.now();
      } else {
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.timeout -> reached maximum retries. Attempt ' + retries + ' of ' + Toolbawks.auth_sso.MAX_LOGIN_RETRY + ' available')
      }
    },
    
    check_if_success : function(json) {
      Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.check_if_success');
      
      if (json && json.logged_in) {
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.check_if_success -> success -> logged in');
        
        retries = 0;

        Toolbawks.auth_sso.Details.set_user_attributes(json.user_attributes, json.local);

        Toolbawks.auth_sso.Login.run_hooks('success', json);
        
        Toolbawks.auth_sso.Login.close();
        
        return true;
      } else {
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.check_if_success -> failure -> login failed');
        
        Toolbawks.auth_sso.Login.run_hooks('failure', json);
        
        Toolbawks.auth_sso.Login.timeout(json);
        
        return false;
      }
    },
    
    local : function() {
      Toolbawks.log('[tbx] Toolbawks.auth_sso.Login.local');
      Toolbawks.auth_sso.Login.now(_local = true);
    }
  };
}();