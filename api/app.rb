require 'sinatra'
require 'livekit'
require 'json'
require 'securerandom'
require 'pry'

API_URL = ENV['API_URL'] || 'http://127.0.0.1:7880'
WS_URL = ENV['WS_URL'] || 'ws://127.0.0.1:7880'
API_KEY = ENV['API_KEY'] || 'devkey'
API_SECRET = ENV['API_SECRET'] || 'secret'

set :bind, '0.0.0.0'

def get_client
    LiveKit::RoomServiceClient.new(API_URL, api_key: API_KEY, api_secret: API_SECRET)
end

def get_token
    LiveKit::AccessToken.new(api_key: API_KEY, api_secret: API_SECRET)
end

post '/rooms' do
    # We'll use this to set the host for the room
    # This might turn into their mastodon id
    identity = SecureRandom.uuid
    # Their display name
    name = params['name']
    # Name of the room/jam/gather
    room_name = params['room']
    # Mastodon address
    # TODO: oauth flow to connect
    mastodon_address = params['mastodon_address']

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
        binding.pry
        grant[:canPublish] = false
    end
    token.add_grant(grant)
    jwt = token.to_jwt

    # avatar from masatodon
    mravatar_resp = Faraday.get("https://mravatar.r669.live/avatar/#{mastodon_address}")
    avatar_url = mravatar_resp.headers['location']
    token.metadata = JSON.generate(avatar_url: avatar_url)

    fragment_data = URI::Generic.build(
        path: '/room',
        query: URI.encode_www_form(
            token: jwt,
            url: WS_URL
        ),
        )
    host = URI.parse(request.referer)
    host.fragment = fragment_data.to_s
    redirect host.to_s
end

get '/rooms' do
    data = get_client.list_rooms.data['rooms'].map{|i| [i['name'], i['num_participants']]}
    JSON.generate(data)
end
