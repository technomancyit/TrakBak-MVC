var socket = io("http://192.168.0.216:1337");
  let apiPostCategories = (data) => {
    socket.emit('apiPostCategories', data);
  console.log("RAN");
  }
  
  let apiGetCategories = (data) => {
    socket.emit('apiGetCategories', data);
  console.log("RAN");
  }
  
  let apiPutCategories = (data) => {
    socket.emit('apiPutCategories', data);
  console.log("RAN");
  }
  
  let apiDeleteCategories = (data) => {
    socket.emit('apiDeleteCategories', data);
  console.log("RAN");
  }
  
  let apiPostGroups = (data) => {
    socket.emit('apiPostGroups', data);
  console.log("RAN");
  }
  
  let apiGetGroups = (data) => {
    socket.emit('apiGetGroups', data);
  console.log("RAN");
  }
  
  let apiPutGroups = (data) => {
    socket.emit('apiPutGroups', data);
  console.log("RAN");
  }
  
  let apiDeleteGroups = (data) => {
    socket.emit('apiDeleteGroups', data);
  console.log("RAN");
  }
  
  let apiPostMessages = (data) => {
    socket.emit('apiPostMessages', data);
  console.log("RAN");
  }
  
  let apiGetMessages = (data) => {
    socket.emit('apiGetMessages', data);
  console.log("RAN");
  }
  
  let apiPutMessages = (data) => {
    socket.emit('apiPutMessages', data);
  console.log("RAN");
  }
  
  let apiDeleteMessages = (data) => {
    socket.emit('apiDeleteMessages', data);
  console.log("RAN");
  }
  
  let apiPostNotifications = (data) => {
    socket.emit('apiPostNotifications', data);
  console.log("RAN");
  }
  
  let apiGetNotifications = (data) => {
    socket.emit('apiGetNotifications', data);
  console.log("RAN");
  }
  
  let apiPutNotifications = (data) => {
    socket.emit('apiPutNotifications', data);
  console.log("RAN");
  }
  
  let apiDeleteNotifications = (data) => {
    socket.emit('apiDeleteNotifications', data);
  console.log("RAN");
  }
  
  let apiPostTickets = (data) => {
    socket.emit('apiPostTickets', data);
  console.log("RAN");
  }
  
  let apiGetTickets = (data) => {
    socket.emit('apiGetTickets', data);
  console.log("RAN");
  }
  
  let apiPutTickets = (data) => {
    socket.emit('apiPutTickets', data);
  console.log("RAN");
  }
  
  let apiDeleteTickets = (data) => {
    socket.emit('apiDeleteTickets', data);
  console.log("RAN");
  }
  
  let apiPostUsers = (data) => {
    socket.emit('apiPostUsers', data);
  console.log("RAN");
  }
  
  let apiGetUsers = (data) => {
    socket.emit('apiGetUsers', data);
  console.log("RAN");
  }
  
  let apiPutUsers = (data) => {
    socket.emit('apiPutUsers', data);
  console.log("RAN");
  }
  
  let apiDeleteUsers = (data) => {
    socket.emit('apiDeleteUsers', data);
  console.log("RAN");
  }
  
socket.on('connected', function (data) {
   console.log('Welcome to my portfolio.');
 });

// Don't Edit above this line -->


var fuck = 'fuck you';