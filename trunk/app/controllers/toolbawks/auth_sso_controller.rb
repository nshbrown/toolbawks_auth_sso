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

class Toolbawks::AuthSsoController < Toolbawks::BaseController
  layout 'toolbawks_auth_sso'
  
  def index
    @sso = get_sso_defaults
  end
  
  def logout
    reply = {}
    reply[:status] = 200
    reply[:retry] = false
    reply[:logged_out] = false
    reply[:local] = params[:toolbawks_auth_sso_logout] && params[:toolbawks_auth_sso_logout][:local] == "true" ? true : false
    
    if sso_logged_in?
      reply[:message] = 'Successfully logged out.'
      reply[:logged_out] = true
    else
      reply[:status] = 500
      reply[:message] = 'You were not logged in.'
    end
    
    set_sso_logged_out
    
    if reply[:local] == true
      render :text => reply.to_json, :status => reply[:status] and return
    else
      render :text => 'var _xsajax$transport_status = ' + reply[:status].to_s + '; var json = ' + reply.to_json + ';', :status => 200 and return
    end
  end
  
  def login
    if params[:toolbawks_auth_sso_login]
      username = params[:toolbawks_auth_sso_login][:username]
      date = params[:toolbawks_auth_sso_login][:date].to_i
      public_key = params[:toolbawks_auth_sso_login][:public_key]
      posted_hash = params[:toolbawks_auth_sso_login][:hash]
      secure_channel = params[:toolbawks_auth_sso_login][:secure_channel]
      remember_me = params[:toolbawks_auth_sso_login][:remember_me] == "true" ? true : false
      
      reply = {}
      reply[:message] = 'Unknown error.'
      reply[:retry] = false
      reply[:status] = 500
      reply[:logged_in] = false
      reply[:local] = params[:toolbawks_auth_sso_login][:local] == "true" ? true : false

      time_diff = (Time.now.to_i - date.to_i)

      if time_diff > ToolbawksAuthSso.MAX_LOGIN_TIME # MAX_LOGIN_TIME (In Seconds)
        timeout = TRUE
      end

      valid_secure_channel = ToolbawksAuthSso::Encrypt.build_secure_channel(public_key)
      
      if secure_channel != valid_secure_channel
        reply[:message] = 'Secure connection unable to be formed. Trying again... please wait.'
        reply[:valid] = false
        reply[:status] = 200

        sso = get_sso_defaults
        reply[:timeout] = true
        reply[:date] = sso[:date]
        reply[:public_key] = sso[:public_key]
        reply[:secure_channel] = sso[:secure_channel]
      elsif get_user_password(username) == false
        reply[:message] = 'Unable to locate your account. Please try again'
        reply[:valid] = false
        reply[:status] = 200
      elsif timeout === TRUE
        reply[:message] = 'Session timed out. Trying again... please wait.'
        reply[:retry] = true
        reply[:valid] = false
        reply[:status] = 200

        sso = get_sso_defaults
        reply[:timeout] = true
        reply[:date] = sso[:date]
        reply[:public_key] = sso[:public_key]
        reply[:secure_channel] = sso[:secure_channel]
      elsif ToolbawksAuthSso::Encrypt.build_login_hash(date, public_key, username, get_user_password(username), remember_me, secure_channel) == posted_hash
        if sso_logged_in?
          reply[:status] = 200
          reply[:logged_in] = true
          reply[:user_attributes] = get_user_attributes
          reply[:message] = 'You are already logged in.'
        else
          # Log them into the system by creating a session
          status = set_sso_signed_in(username, remember_me)

          reply[:valid] = true
          reply[:status] = 200
          reply[:logged_in] = true
          reply[:user_attributes] = get_user_attributes
          reply[:message] = 'Login Successful'
        end
      else
        logger.debug '[tbx] ToolbawksAuthSsoController.login -> invalid username or password.'
        reply[:message] = 'Username or Password is incorrect'
        reply[:status] = 200
        reply[:valid] = false
      end

      if reply[:local] == true
        render :text => reply.to_json, :status => reply[:status] and return
      else
        render :text => 'var _xsajax$transport_status = ' + reply[:status].to_s + '; var json = ' + reply.to_json + ';', :status => 200 and return
      end
    else
      render :text => '', :status => 500 and return
    end
#  rescue
#    render :text => 'Error occurred', :status => 200 and return
  end
  
  def check_login_status
    reply = {}
    reply[:logged_in] = false
    reply[:status] = 500
    reply[:message] = 'Unknown error.'
    reply[:logged_in] = false
    reply[:retry] = false
    reply[:local] = false

    if params[:toolbawks_auth_sso_status]
      options = {}
      options[:date]  = params[:toolbawks_auth_sso_status][:date].to_i
      options[:public_key] = params[:toolbawks_auth_sso_status][:public_key]
      options[:posted_hash] = params[:toolbawks_auth_sso_status][:hash]
      reply[:local] = params[:toolbawks_auth_sso_status][:local] == 'true' ? true : false

      # hash of the public key and the private key together. 
      # Provides an Instant check to see if the request is authorized
      options[:secure_channel] = params[:toolbawks_auth_sso_status][:secure_channel]
    
      time_diff = (Time.now.to_i - options[:date].to_i)

      valid_secure_channel = ToolbawksAuthSso::Encrypt.build_secure_channel(options[:public_key])

      logger.info '[tbx] Toolbawks::AuthSsoController -> options : ' + options.inspect

      if !options[:secure_channel] || !options[:public_key] || options[:secure_channel] != valid_secure_channel
        reply[:status] = 500
        reply[:message] = 'Secure connection unable to be formed. Please try again.'
        
        logger.info "[tbx] Toolbawks::AuthSsoController -> options[:secure_channel] : #{ options[:secure_channel] }, valid_secure_channel : #{ valid_secure_channel }, options[:public_key] : #{ options[:public_key] }"
      
        sso = get_sso_defaults
        reply[:timeout] = true
        reply[:date] = sso[:date]
        reply[:public_key] = sso[:public_key]
        reply[:secure_channel] = sso[:secure_channel]
      elsif time_diff > ToolbawksAuthSso.MAX_LOGIN_TIME # MAX_LOGIN_TIME (In Seconds)
        reply[:message] = 'Session timed out. Trying again... please wait.'
        reply[:valid] = false
        reply[:status] = 200
        reply[:retry] = true

        sso = get_sso_defaults
        reply[:timeout] = true
        reply[:date] = sso[:date]
        reply[:public_key] = sso[:public_key]
        reply[:secure_channel] = sso[:secure_channel]
      elsif ToolbawksAuthSso::Encrypt.build_check_hash(options[:date], options[:public_key], options[:secure_channel]) == options[:posted_hash]
        if sso_logged_in? == true
          reply[:status] = 200
          reply[:logged_in] = true
          reply[:user_attributes] = get_user_attributes
          reply[:message] = 'You are logged in.'
        else
          reply[:message] = 'You are not logged in.'
          reply[:status] = 200
        end
      end
    end

    if reply[:local] == true
      render :text => reply.to_json, :status => reply[:status] and return
    else
      render :text => 'var _xsajax$transport_status = ' + reply[:status].to_s + '; var json = ' + reply.to_json + ';', :status => 200 and return
    end
  end
  
private

  def sso_logged_in?
    if session[:username] != false && !session[:username].nil? && session[:username] != ''
      true
    else
      false
    end
  end

  def get_user_password(username)
    # Must be a plain text version
    
    if !username.nil? && username && username.length > 0
      # this will be fetched from the database
      'toolbawks_auth_sso' # Default password to test it out
    else
      false
    end
  end
  
  def get_user_attributes
    attributes = false

    begin
      user = ToolbawksUser.find_by_username(session[:username])
      attributes = user.attributes
    rescue
      # User not found
    end
    
    return attributes
  end
  
  def set_sso_logged_out
     session[:username] = nil
  end
  
  def set_sso_signed_in(username)
    session[:username] = username
  end
end