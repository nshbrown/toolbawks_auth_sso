Plugin = {};
Plugin.auth_sso = {};

Plugin.auth_sso.Example = function(){
  return {
    add_hooks : function() {
      Toolbawks.auth_sso.Login.add_hook('success', Plugin.auth_sso.Example.hook_after_login);
      Toolbawks.auth_sso.Logout.add_hook('success', Plugin.auth_sso.Example.hook_after_logout);
    },
    
    hook_after_login : function(json) {
      Toolbawks.log('[example] Plugin.auth_sso.Example.hook_after_login -> json...');
      Toolbawks.dir(json);
      Toolbawks.auth_sso.Status.update();
    },
    
    hook_after_logout : function(json) {
      Toolbawks.log('[example] Plugin.auth_sso.Example.hook_after_logout -> json...');
      Toolbawks.dir(json);
      Toolbawks.auth_sso.Status.update();
    }
  };
}();

Event.observe(window, 'load', function() {
  Plugin.auth_sso.Example.add_hooks();
});