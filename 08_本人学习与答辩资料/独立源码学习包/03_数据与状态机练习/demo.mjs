import {createPilotState,pilotReducer} from './training-engine.mjs';
let state=createPilotState(3);
for(const event of [{type:'request'},{type:'approve',expectedVersion:0},{type:'restore',vacancySec:300,staffConfirmed:true},{type:'request'},{type:'advance',seconds:600},{type:'request'}]){
  const result=pilotReducer(state,event);state=result.state;console.log(event.type,result.result,JSON.stringify(state));
}
