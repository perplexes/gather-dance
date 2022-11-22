require 'sinatra'
require 'livekit'
require 'json'
require 'securerandom'
require 'pry'
require 'logger'

API_URL = ENV['API_URL'] || 'http://127.0.0.1:7880'
API_KEY = ENV['API_KEY'] || 'devkey'
API_SECRET = ENV['API_SECRET'] || 'secret'

set :bind, '0.0.0.0'
set :logging, Logger::DEBUG

def get_client
    LiveKit::RoomServiceClient.new(API_URL, api_key: API_KEY, api_secret: API_SECRET)
end

def get_token
    LiveKit::AccessToken.new(api_key: API_KEY, api_secret: API_SECRET)
end

post '/rooms' do
    body = JSON.parse(request.body.read)
    # We'll use this to set the host for the room
    # This might turn into their mastodon id
    identity = SecureRandom.uuid
    # Name of the room/jam/gather
    room_name = body['room']
    # Mastodon address
    # TODO: oauth flow to connect
    mastodon_address = body['mastodon_address']
    binding.pry
    name = mastodon_address.split('@').reject(&:empty?).first

    token = get_token
    token.identity = identity
    token.name = name
    grant = {roomJoin: true, room: room_name}
    
    client = get_client
    room = client.create_room(room_name)
    if room.data['metatdata'].nil?
        # This is the owner of the room
        client.update_room_metadata(room: room_name, metadata: JSON.generate(owner: identity))
        grant[:canPublish] = true
        grant[:roomAdmin] = true
    # TODO: Planned moderator? Special moderator link (w/jwt embed or link shortened?)
    else
        grant[:canPublish] = false
    end
    token.add_grant(grant)
    jwt_token = token.to_jwt

    # avatar from masatodon
    # TODO: This could fail; and we should probably run our own?
    # TODO: This should be async / part of oauth flow so it can take a while
    begin
        mravatar_resp = Faraday.get("https://mravatar.r669.live/avatar/#{mastodon_address}")
        avatar_url = mravatar_resp.headers['location']
    rescue
    end

    response_obj = {
        jwt_token: jwt_token,
        avatar_url: avatar_url,
        mastodon_address: mastodon_address,
    }
    # TODO: fix this in production (i.e. not just anyone)
    response['Access-Control-Allow-Origin'] = request.get_header('HTTP_ORIGIN') || 'http://localhost:3000'
    JSON.generate(response_obj)
end

get '/rooms' do
    data = get_client.list_rooms.data['rooms'].map{|i| [i['name'], i['num_participants']]}
    JSON.generate(data)
end
