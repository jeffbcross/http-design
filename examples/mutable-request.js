/* Begin Framework */

class BaseRequestConfig {
  getProgressively:boolean;
  hot:boolean;
  method:string;
  url:string;

  constructor() {
    this.getProgressively = false;
    this.hot = true;
    this.method = 'get';
    this.url = null;
  }
}

class Http {
  baseRequest:BaseRequestConfig;
  @Inject(BaseRequestConfig)
  constructor(baseRequest) {
    this.baseRequest = baseRequest;
  }

  request (config) {
    //Merge in case the provided config wasn't derived from base request
    var mergedConfig = this.mergeConfigs(config, baseRequest);
    //create and return connection
  }

  mergeConfigs (authority, defaults) {
    //...
  }
}

/* End Framework */
/* Begin Application */

class AppComponent {
  @Inject(BaseRequestConfig)
  constructor(baseRequestConfig) {
    //Danger! Setting property of shared global config!
    baseRequestConfig.hot = false;
  }
}

class MyComponent {
  @Inject(Http)
  constructor(http) {
    //Hopefully this component author knows that the app component has set hot
    //to false so they can explicitly set hot back to true
    http.request({
      hot: true,
      method: 'post',
      url: 'https://apploggingservice',
      body: 'user action at: ' + Date.now()
    });
  }
}
