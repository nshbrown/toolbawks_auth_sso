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

Toolbawks.auth_sso.Status = function(){
  var retries = 0;
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
      if (!Toolbawks.auth_sso.Status.verify_hook_scope(scope)) {
        Toolbawks.error('[tbx] Toolbawks.auth_sso.Status.add_hook : Hook failed to be added to scope [' + scope + ']. Hook details : ' + func);
        return false;
      }

      if (typeof func != 'undefined' && typeof func == 'function') {
        _.hooks[scope][_.hooks[scope].length] = func;
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Status.add_hook : Added hook to scope [' + scope + ']. Hook details : ' + func);
      } else {
        Toolbawks.error('Toolbawks.auth_sso.Status.add_hook -> invalid hook being added to scope (' + scope + ')...');
      }
    },
    
    get_hooks : function(scope) {
      if (!Toolbawks.auth_sso.Status.verify_hook_scope(scope)) {
        Toolbawks.error('[tbx] Toolbawks.auth_sso.Status.get_hooks : Invalid scope while fetching hooks');
        return false;
      }
      return _.hooks[scope];
    },
    
    run_hooks : function(scope, json) {
      Toolbawks.auth_sso.Status.get_hooks(scope).each(function(hook) {
        Toolbawks.log('Toolbawks.auth_sso.Status.run_hooks -> running ' + scope + ' hook...');
        if (typeof hook == 'function') {
          hook(json);
        } else {
          Toolbawks.error('Toolbawks.auth_sso.Login.run_hooks -> running ' + scope + ' hook...');
        }
      });
    },
    
    update : function() {
      Toolbawks.auth_sso.Status.build_hash();
    },
    
    update_local : function() {
      Toolbawks.auth_sso.Status.build_hash(_local = true);
    },
    
    build_hash : function(local) {
      local = (local == true) ? true : false;
      
      Toolbawks.log('Toolbawks.auth_sso.Status.build_hash');

      var hash = Toolbawks.auth_sso.Hash.build_status_key();

      if (!Toolbawks.auth_sso.Hash.valid(hash)) {
        Toolbawks.error('Toolbawks.auth_sso.Status.build_hash -> hash not defined');
        return false;
      }

      $('toolbawks_auth_sso_status_field_hash').value = hash;
      
      Toolbawks.auth_sso.Status.request(local);
    },
    
    request : function (local) {
      var url = (!local && Toolbawks.auth_sso.DOMAIN ? Toolbawks.auth_sso.DOMAIN : '') + Toolbawks.auth_sso.PATH_CONTROLLER + '/check_login_status';
      var params = Form.serialize($('toolbawks_auth_sso_status'), true);
      var method = 'GET';

      local = Toolbawks.util.QueryString.local(url) ? true : local;

      if (local) {
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Status.submit -> local request');
        params['toolbawks_auth_sso_status[local]'] = "true";
      }

      var responseSuccess = function(o) {
        Toolbawks.info('Toolbawks.auth_sso.Status.request -> responseSuccess');

        if (o && o.responseText && !o.responseText.match(/transport_status/)) {
          // json not defined, convert from response text
          json = eval('(' + o.responseText + ')');
        }
        
        try {
          $('toolbawks_auth_sso_status_message').update(json.message);
        } catch (e) {}

        Toolbawks.auth_sso.Status.check_if_success(json);
      };

      var responseFailure = function(o) {
        Toolbawks.error('Toolbawks.auth_sso.Status.request -> responseFailure');

        if (o && o.responseText && !o.responseText.match(/transport_status/)) {
          // json not defined, convert from response text
          json = eval('(' + o.responseText + ')');
        }
        
        try {
          $('toolbawks_auth_sso_status_message').update(json.message);
        } catch(e) {}

        Toolbawks.auth_sso.Status.check_if_success(json);
      };

      var ajax_options = {
        method: method,
        crossSite: local ? false : true,
        onFailure: responseFailure,
        onSuccess: responseSuccess,
        parameters: params
      };
      
      Toolbawks.info('[tbx] Toolbawks.auth_sso.Status.submit -> ajax_options...');
      Toolbawks.dir(ajax_options);
      
      new Ajax.Request(url, ajax_options);
    },
    
    retry : function(json) {
      if (json.retry == true && retries < Toolbawks.auth_sso.MAX_STATUS_RETRY) {
        Toolbawks.log('Toolbawks.auth_sso.Status.request -> responseSuccess -> timeout -> retry ' + retries + ' of ' + Toolbawks.auth_sso.MAX_STATUS_RETRY)
        retries++;
        Toolbawks.auth_sso.Status.run_hooks('retry', json);
        Toolbawks.auth_sso.Status.update();
      } else {
        Toolbawks.log('Toolbawks.auth_sso.Status.request -> responseSuccess -> timeout -> reached maximum retries. Attempt ' + retries + ' of ' + Toolbawks.auth_sso.MAX_STATUS_RETRY + ' available')
      }
    },
    
    check_if_success : function(json) {
      Toolbawks.log('[tbx] Toolbawks.auth_sso.Status.check_if_success');

      if (json && json.logged_in) {
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Status.check_if_success -> success -> logged in');
        
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Status.check_if_success -> success -> json...');
        Toolbawks.dir(json);
        
        retries = 0;

        Toolbawks.auth_sso.Details.set_user_attributes(json.user_attributes, json.local);

        Toolbawks.auth_sso.Status.run_hooks('success', json);

        return true;
      } else {
        Toolbawks.log('[tbx] Toolbawks.auth_sso.Status.check_if_success -> failure -> login failed');

        Toolbawks.auth_sso.Status.run_hooks('failure', json);

        Toolbawks.auth_sso.Status.timeout(json);

        return false;
      }
    },
    
    timeout : function(json) {
      if (json.timeout) {
        $('toolbawks_auth_sso_status_field_date').value = json.date;
        $('toolbawks_auth_sso_status_field_public_key').value = json.public_key;
        $('toolbawks_auth_sso_status_field_secure_channel').value = json.secure_channel;

        Toolbawks.auth_sso.Status.run_hooks('timeout', json);

        Toolbawks.auth_sso.Status.retry(json);
      }
    }
  };
}();