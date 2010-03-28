class ToolbawksAuthSso::Encrypt
  def self.public_key(length, valid_chars = "")
     valid_chars = ToolbawksAuthSso.RANDOM_CHARS if !valid_chars || valid_chars.nil? || valid_chars == ""
     length = ToolbawksAuthSso.PUBLIC_KEY_LENGTH if !length || length <= 0
     
     random_string = ""
     
     (0..length).each do |i|
       random_string += valid_chars[rand(valid_chars.length - 1)].chr
     end

     logger.info '[tbx] ToolbawksAuthSso::Encrypt.public_key(length : ' + length.to_s + ', valid_chars: "' + valid_chars + '") = "' + random_string + '"'

     return random_string
  end

  def self.build_login_hash(date, public_key, username, password, remember_me, secure_channel)
    raw_string = "#{ date }#{ public_key }#{ username }#{ password }#{ remember_me }#{ secure_channel }"
    hash = ToolbawksAuthSso::Encrypt.send(ToolbawksAuthSso.AUTH_TYPE, raw_string)
    logger.info '[tbx] ToolbawksAuthSso::Encrypt.build_login_hash(raw_string => "' + raw_string + '") = "' + hash + '"'
    hash
  end
  
  def self.build_check_hash(date, public_key, secure_channel)
    raw_string = "#{ date }#{ public_key }#{ secure_channel }"
    hash = ToolbawksAuthSso::Encrypt.send(ToolbawksAuthSso.AUTH_TYPE, raw_string)
    logger.info '[tbx] ToolbawksAuthSso::Encrypt.build_check_hash(raw_string => "' + raw_string + '") = "' + hash + '"'
    hash
  end
  
  def self.build_secure_channel(public_key)
    private_key = ToolbawksAuthSso.PRIVATE_KEY
    raw_string = "#{ public_key }#{ private_key }"
    hash = ToolbawksAuthSso::Encrypt.send(ToolbawksAuthSso.AUTH_TYPE, raw_string)
    logger.info '[tbx] ToolbawksAuthSso::Encrypt.build_secure_channel(raw_string => "' + raw_string + '") = "' + hash + '"'
    hash
  end

  def self.md5(str)
    require 'digest/md5'
    hash = Digest::MD5.hexdigest(str)
#    logger.info '[tbx] ToolbawksAuthSso::Encrypt.md5(str => "' + str + '") = "' + hash + '"'
    hash
  end

  def self.md4
    logger.error 'Not supported yet'
  end

  def self.sha1(str)
    require 'digest/sha1'
    hash = sha1(str)
#    logger.info '[tbx] ToolbawksAuthSso::Encrypt.sha1(str => "' + str + '") = "' + hash + '"'
    hash
  end
end