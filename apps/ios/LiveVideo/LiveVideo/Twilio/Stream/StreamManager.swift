//
//  Copyright (C) 2021 Twilio, Inc.
//

import TwilioPlayer

class StreamManager: ObservableObject {
    @Published var player: Player?
    @Published var showError = false
    @Published var error: Error? {
        didSet {
            showError = error != nil
        }
    }
    private let api = API.shared
    private let playerManager = PlayerManager()
    
    init() {
        playerManager.delegate = self
    }

    func connect(config: StreamConfig) {
        let request = StreamTokenRequest(userIdentity: config.userIdentity, roomName: config.roomName)
        
        api.request(request) { [weak self] result in
            switch result {
            case let .success(response):
                self?.playerManager.configure(accessToken: response.token)
                self?.playerManager.connect()
            case let .failure(error):
                self?.error = error
            }
        }
    }
    
    func disconnect() {
        playerManager.disconnect()
        player = nil
    }
    
    private func handleError(_ error: Error) {
        disconnect()
        self.error = error
    }
}

extension StreamManager: PlayerManagerDelegate {
    func playerManagerDidConnect(_ playerManager: PlayerManager) {
        player = playerManager.player
    }
    
    func playerManager(_ playerManager: PlayerManager, didDisconnectWithError error: Error) {
        handleError(error)
    }
}
