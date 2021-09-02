//
//  Copyright (C) 2021 Twilio, Inc.
//

import SwiftUI
import ToastUI

struct StreamView: View {
    @EnvironmentObject var streamManager: StreamManager
    @Environment(\.presentationMode) var presentationMode
    @Binding var config: StreamConfig!
    @State private var presentingToast: Bool = false
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                Color.videoGridBackground.ignoresSafeArea()
                VStack(spacing: 0) {
                    VStack(spacing: 0) {
                        HStack {
                            LiveBadge()
                            Spacer()
                            Text("Room name")
                                .foregroundColor(.white)
                                .font(.system(size: 16))
                        }
                        .padding(6)
                        ZStack {
                            SwiftUIPlayerView(player: $streamManager.player)
    //                        Color.purple
//                            ProgressView()
//                                .progressViewStyle(CircularProgressViewStyle(tint: .green))
                        }
                    }
                    .padding(.leading, geometry.safeAreaInsets.leading)
                    .padding(.trailing, geometry.safeAreaInsets.trailing)
                    HStack {
                        Spacer()
                        Button(action: {
                            presentationMode.wrappedValue.dismiss()
                        }) {
                            VStack(spacing: 4) {
                                Image(systemName: "arrow.left.circle.fill")
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .foregroundColor(.destructive)
                                    .frame(width: 24, height: 24, alignment: .bottom)
                                Text("Leave")
                                    .font(.system(size: 10))
                            }
                            .padding(.top, 7)
                            .frame(minWidth: 50)
                            .foregroundColor(.videoToolbarText)
                        }
                        Spacer()
                    }
                    .background(Color.formBackground)
                    Color.formBackground
                        .frame(height: geometry.safeAreaInsets.bottom)
                }
                .edgesIgnoringSafeArea([.bottom, .horizontal])

                if streamManager.isLoading {
                    ZStack {
                        Color.videoGridBackground
                            .opacity(0.8)
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .green))
                            .scaleEffect(2)
                    }
                    .ignoresSafeArea()
                }
            }
        }
//        .toast(isPresented: $streamManager.isLoading) {
//          print("Toast dismissed")
//        } content: {
//            ZStack {
//                Color.videoGridBackground
//                    .ignoresSafeArea()
//                    .opacity(0.8)
//                ProgressView()
//                    .progressViewStyle(CircularProgressViewStyle(tint: .green))
//                    .scaleEffect(2)
//            }

//            ToastView(
//                content: {
//                    Text("Loading")
//                        .foregroundColor(.green)
//                },
//                background: {
//                    Color.black
//                        .opacity(0.5)
//                }
//            )
//
//          ToastView("Loading...")
//            .toastViewStyle(IndefiniteProgressToastViewStyle())
//        }
        .onAppear {
            presentingToast = true
            streamManager.connect(config: config)
        }
//            .alert(isPresented: $streamManager.showError) {
//                if let error = streamManager.error as? LiveVideoError, error.isStreamEndedByHostError {
//                    return Alert(
//                        title: Text("Event is no longer available"),
//                        message: Text("This event has been ended by the host."),
//                        dismissButton: .default(Text("OK")) {
//                            presentationMode.wrappedValue.dismiss()
//                        }
//                    )
//                } else {
//                    return Alert(error: streamManager.error!) {
//                        presentationMode.wrappedValue.dismiss()
//                    }
//                }
//            }
    }
}

struct StreamView_Previews: PreviewProvider {
    static var previews: some View {
        StreamView(config: .constant(StreamConfig(roomName: "", userIdentity: "")))
            .environmentObject(StreamManager())
    }
}
