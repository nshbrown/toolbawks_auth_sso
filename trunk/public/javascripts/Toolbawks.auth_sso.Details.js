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

Toolbawks.auth_sso.Details = function(){
  var _ = {
    cached_password : false,
    user_attributes : {
      local : false,
      remote : false,
    }
  };
  
  return {
    set_user_attributes : function(attrs, local) {
      if (!local || local == undefined || local == '') {
        local = false;
      }
      
      Toolbawks.log('[tbx] Toolbawks.auth_sso.Details.set_user_attributes for ' + (local ? 'local' : 'remote') + '...');
      Toolbawks.dir(attrs);

      _.user_attributes[(local ? 'local' : 'remote')] = attrs;
    },
    
    get_user_attributes : function(local) {
      if (!local || local == undefined || local == '') {
        local = false;
      }
      
      var attrs = _.user_attributes[(local ? 'local' : 'remote')];
      
      Toolbawks.log('[tbx] Toolbawks.auth_sso.Details.get_user_attributes for ' + (local ? 'local' : 'remote') + '...');
      Toolbawks.dir(attrs);

      return attrs;
    },
    
    get_cached_password : function() {
      return _.cached_password;
    },
    
    set_cached_password : function(pwd) {
      _.cached_password = pwd;
    }
  };
}();