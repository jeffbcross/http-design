/* Begin Framework */

class BaseRequestConfig extends ImmutableMap {
  constructor() {
    super({
      getProgressively: false,
      hot: true,
      method: 'get',
      url: undefined,
      body: undefined
    });
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

/* module: AppRequestConfig */
var myAppConfig;

@Inject(BaseRequestConfig)
export function AppRequestConfig (baseRequest) {
  /**
   * No global mutable state!
   * I don't have to worry about some other part of my
   * app changing the defaults under me. They would have to change this factory
   * implementation.
   * Developers only have to look at this module to know what the default overrides are
   **/
  if (myAppconfig) return myAppConfig;
  myAppConfig = baseRequest.merge({
    hot: false
  });
  return myAppConfig;
}
/* end module: AppRequestConfig */

class MyComponent {
  @Inject(Http, AppRequestConfig)
  constructor(http, myAppConfig) {
    //Creates new request config, doesn't actually affect injected map.
    var request = myAppConfig.merge({
      hot: true,
      method: 'post',
      url: 'https://apploggingservice',
      body: 'user action at: ' + Date.now()
    });
    http.request(request);
  }
}
