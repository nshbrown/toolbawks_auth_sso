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

module ToolbawksAuthSso::RailsExtensions::ActionControllerExtension
  def self.included(base)
#    base.helper_method(get_sso_defaults)  
  end

public

#  module ClassMethods
#    unloadable
#    include ToolbawksAuthSso::RailsExtensions::ActionControllerExtension::Helpers
#  end
  
#  module Helpers
    def get_sso_defaults
      if !@sso
        sso = {
          :date => Time.now.to_i,
          :public_key => ToolbawksAuthSso::Encrypt.public_key(ToolbawksAuthSso.PUBLIC_KEY_LENGTH),
          :secure_channel => false,
          :username => nil,
          :password => nil
        }

        sso[:secure_channel] = ToolbawksAuthSso::Encrypt.build_secure_channel(sso[:public_key])

        logger.info '[tbx] ToolbawksAuthSsoController.get_sso_defaults -> sso : ' + sso.inspect

        @sso = sso
      else
        sso = @sso
      end

      return sso
    end
#  end
end