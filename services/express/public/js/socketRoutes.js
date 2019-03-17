socket.on('joinRoom', function (obj) {
                console.log('message: ' + obj);
            });
    
            function socketJoinRoom(obj) {
                socket.emit('joinRoom', obj);
              }socket.on('leaveRoom', function (obj) {
                console.log('message: ' + obj);
            });
    
            function socketLeaveRoom(obj) {
                socket.emit('leaveRoom', obj);
              }socket.on('socketPush', function (obj) {
                console.log('message: ' + obj);
            });
    
            function socketSocketPush(obj) {
                socket.emit('socketPush', obj);
              }socket.on('sendInfo', function (obj) {
                console.log('message: ' + obj);
            });
    
            function socketSendInfo(obj) {
                socket.emit('sendInfo', obj);
              }socket.on('test', function (obj) {
                console.log('message: ' + obj);
            });
    
            function socketGetTest(obj) {
                socket.emit('test', obj);
              }