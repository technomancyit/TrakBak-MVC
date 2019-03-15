var userApp = new Vue({
    el: '#userApp',
    data: { 
    me:'',
    mgSync: {},
    alerts: [],
    forgotPassword: false,
    recaptchSiteKey: "6LfBBZYUAAAAAEfdHor9VmKw7zBAPs9ou45lfoCq",

    forms: {
        sendEmail: {
            recaptcha: {
                on:'display:none',
                off:''
            }
        }
    }

 },
    watch: {
    },
    methods: { 
    
 },
    
    end: {
      
    }
  })