# Copyright (c) 2007 Nathaniel Brown
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

module ApplicationHelper
  include ToolbawksAuthSso::RailsExtensions::ActionControllerExtension
  
  def toolbawks_auth_sso_head(options = {})
    options = merge_options(options)
    
    <<-EOL
    #{ stylesheet_link_tag 'Toolbawks.auth_sso.css', :plugin => 'toolbawks_auth_sso' }
    #{ javascript_include_tag 'Toolbawks.auth_sso.js', 'Toolbawks.auth_sso.Hash.js', 'Toolbawks.auth_sso.Details.js', 'Toolbawks.auth_sso.Status.js', 'Toolbawks.auth_sso.Login.js', 'Toolbawks.auth_sso.Logout.js', 'Toolbawks.' + ToolbawksAuthSso.AUTH_TYPE + '.js', :plugin => 'toolbawks_auth_sso' }
EOL
  end
  
  def toolbawks_auth_sso_head_config(options = {})
    <<-EOL
    #{ javascript_tag 'Toolbawks.auth_sso.TYPE = "' + ToolbawksAuthSso.AUTH_TYPE + '";' if ToolbawksAuthSso.AUTH_TYPE != 'md5' }
    #{ javascript_tag 'Toolbawks.auth_sso.DOMAIN = "' + options[:domain] + '";' if options[:domain] && !options[:domain].nil? }
    #{ javascript_tag 'Toolbawks.auth_sso.PATH_CONTROLLER = "' + options[:path_controller] + '";' if options[:path_controller] && !options[:path_controller].nil? }
    #{ javascript_tag 'Toolbawks.console.enabled = true;' if options[:console] && options[:console] == true }
EOL
  end
  
private

  def merge_options(options)
    options[:domain] = ToolbawksAuthSso.DOMAIN if options[:domain].nil?
    options[:path] = ToolbawksAuthSso.PATH_CONTROLLER if options[:path].nil?

    options[:path] = nil if options[:path] == ToolbawksAuthSso.PATH_CONTROLLER
    options[:domain] = nil if options[:domain] == ToolbawksAuthSso.DOMAIN
    
    options
  end
end