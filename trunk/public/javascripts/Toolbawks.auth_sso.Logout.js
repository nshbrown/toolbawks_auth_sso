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

Toolbawks.auth_sso.Logout = function(){
  var _ = {
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
        Toolbawks.error('[tbx] Toolbawks.auth_sso.Logout.add_hook : Hook failed to be added to scope [' + scope + ']. Hook details : ' + func);
        return false;
      }

      if (typeof func != 'undefined' && typeof func == 'function') {
        _.hooks[scope][_.hooks[scope].length] = func;
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Logout.add_hook : Added hook to scope [' + scope + ']. Hook details : ' + func);
      } else {
        Toolbawks.error('Toolbawks.auth_sso.Logout.add_hook -> invalid hook being added to scope (' + scope + ')...');
      }
    },
    
    get_hooks : function(scope) {
      if (!Toolbawks.auth_sso.Login.verify_hook_scope(scope)) {
        Toolbawks.error('[tbx] Toolbawks.auth_sso.Logout.get_hooks : Invalid scope while fetching hooks');
        return false;
      }
      return _.hooks[scope];
    },
    
    run_hooks : function(scope, json) {
      Toolbawks.auth_sso.Logout.get_hooks(scope).each(function(hook) {
        Toolbawks.log('Toolbawks.auth_sso.Logout.run_hooks -> running ' + scope + ' hook...');
        if (typeof hook == 'function') {
          hook(json);
        } else {
          Toolbawks.error('Toolbawks.auth_sso.Login.run_hooks -> running ' + scope + ' hook...');
        }
      });
    },

    now : function(local) {
      if (!local || local == undefined || local == '') {
        local = false;
      }
      
      Toolbawks.log('Toolbawks.auth_sso.Logout.now');

      var hash = Toolbawks.auth_sso.Hash.build_logout_key();
      var _ = Toolbawks.auth_sso.Hash.get_form_element_values('logout');

      if (!Toolbawks.auth_sso.Hash.valid(hash)) {
        Toolbawks.error('Toolbawks.auth_sso.Logout.now -> hash not defined');
        return false;
      } else if (_ == false) {
        Toolbawks.warn('[tbx] Toolbawks.auth_sso.Logout.now -> form values are empty -> unable to grab password if a timeout/retry is required');
      }

      $('toolbawks_auth_sso_logout_field_hash').value = hash;
      
      return Toolbawks.auth_sso.Logout.submit(local);
    },
    
    submit : function(local) {
      var url = (!local && Toolbawks.auth_sso.DOMAIN ? Toolbawks.auth_sso.DOMAIN : '') + Toolbawks.auth_sso.PATH_CONTROLLER + '/logout';
      var params = Form.serialize($('toolbawks_auth_sso_logout'), true);

      local = Toolbawks.util.QueryString.local(url) ? true : local;

      if (local) {
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Logout.submit -> local request');
        params['toolbawks_auth_sso_logout[local]'] = "true";
      }

      params['toolbawks_auth_sso_logout[remember_me]'] = Toolbawks.auth_sso.Hash.get_form_element_values('logout').remember_me;

      var method = 'GET';

      var responseSuccess = function(o) {
        Toolbawks.log('Toolbawks.auth_sso.Logout.submit -> responseSuccess');

        if (o && o.responseText && !o.responseText.match(/transport_status/)) {
          // json not defined, convert from response text
          json = eval('(' + o.responseText + ')');
        }

        try {
          $('toolbawks_auth_sso_logout_message').update(json.message);
          Toolbawks.log('Toolbawks.auth_sso.Logout.submit -> responseSuccess -> updated response message');
        } catch(e) {
          Toolbawks.log('[tbx] Toolbawks.auth_sso.Logout.submit -> responseSuccess -> missing message container')
        }

        Toolbawks.auth_sso.Logout.check_if_success(json);
      };

      var responseFailure = function(o) {
        Toolbawks.error('Toolbawks.auth_sso.Logout.submit -> responseFailure');

        if (o && o.responseText && !o.responseText.match(/transport_status/)) {
          // json not defined, convert from response text
          json = eval('(' + o.responseText + ')');
        }

        try {
          $('toolbawks_auth_sso_logout_message').update(json.message);
          Toolbawks.log('Toolbawks.auth_sso.Logout.submit -> responseFailure -> updated response message');
        } catch(e) {
          Toolbawks.log('[tbx] Toolbawks.auth_sso.Logout.submit -> responseFailure -> missing message container')
        }

        Toolbawks.auth_sso.Logout.check_if_success(json);
      };

      var ajax_options = {
        method: method,
        crossSite: local ? false : true,
        onFailure: responseFailure,
        onSuccess: responseSuccess,
        parameters: params
      };
      
      Toolbawks.info('[tbx] Toolbawks.auth_sso.Logout.submit -> ajax_options...');
      Toolbawks.dir(ajax_options);
      
      new Ajax.Request(url, ajax_options);
    },
    
    retry : function() {
      if (json.retry == true && retries < Toolbawks.auth_sso.MAX_LOGOUT_RETRY) {
        Toolbawks.log('Toolbawks.auth_sso.Logout.retry -> responseSuccess -> timeout -> executing retry ' + retries + ' of ' + Toolbawks.auth_sso.MAX_LOGOUT_RETRY)
        retries++;
        Toolbawks.auth_sso.Logout.now();

        Toolbawks.auth_sso.Logout.run_hooks('retry', json);
      } else {
        Toolbawks.log('Toolbawks.auth_sso.Logout.retry -> responseSuccess -> timeout -> reached maximum retries. Attempt ' + retries + ' of ' + Toolbawks.auth_sso.MAX_LOGOUT_RETRY + ' available')
      }
    },
    
    timeout : function(json) {
      if (json.timeout) {
        $('toolbawks_auth_sso_logout_field_date').value = json.date;
        $('toolbawks_auth_sso_logout_field_public_key').value = json.public_key;
        $('toolbawks_auth_sso_logout_field_secure_channel').value = json.secure_channel;

        Toolbawks.auth_sso.Logout.retry();

        Toolbawks.auth_sso.Logout.run_hooks('timeout', json);
      }
    },
    
    check_if_success : function(json) {
      if (json && json.logged_out == true) {
        Toolbawks.auth_sso.Logout.run_hooks('success', json);

        Toolbawks.auth_sso.Details.set_user_attributes(false, json.local);
        
        return true;
      } else {
        Toolbawks.auth_sso.Logout.run_hooks('failure', json);

        Toolbawks.auth_sso.Logout.timeout(json);

        return false;
      }
    },
    
    local : function() {
      // send ajax request to local server and log out
      Toolbawks.log('Toolbawks.auth_sso.Logout.local');
      Toolbawks.auth_sso.Logout.now(_local = true);
    }
  };
}();