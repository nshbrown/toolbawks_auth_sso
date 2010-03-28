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

module ToolbawksAuthSso
  mattr_accessor :AUTH_TYPE, :MAX_LOGIN_TIME, :PRIVATE_KEY, :PUBLIC_KEY_LENGTH, :RANDOM_CHARS, :DOMAIN, :PATH_CONTROLLER

  self.AUTH_TYPE = 'md5' # md4, md5 or sha1 (default is md5)
  self.MAX_LOGIN_TIME = 1 * 60 # number of minutes they must login after loading the page
  self.RANDOM_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_."
  self.PRIVATE_KEY = '8254e76d30bf65d305e91a13272439f7d4762f3e32f055b83f9e2a10e9a1f76d81dfc65168585e0a624cc4246873ca700afca14077cffad5696fa2225f6d030d' # Any length string that is used as a salt for the encryption
  self.PUBLIC_KEY_LENGTH = 44
  
  # also set in Auth.js
  self.DOMAIN = false # default: same domain
  
  # also set in Auth.js
  self.PATH_CONTROLLER = '/toolbawks/auth_sso' # default: '/toolbawks/auth_sso'
end

# Include all our auth_sso rails extensions
require 'toolbawks_auth_sso/rails_extensions'