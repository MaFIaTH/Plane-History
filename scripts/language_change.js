const Patches = require('Patches');
const Reactive = require('Reactive');
export const Diagnostics = require('Diagnostics');

;(async function () {
  var langIndex = 0;
  var planeIndex = 0;
  var finalAudioIndex = 0;
  var wrightFoundBool = false;
  var dc3FoundBool = false;
  var boeingFoundBool = false;

  function sumItUp ()
  {
    if (wrightFoundBool)
    {
      planeIndex = 0;
    }
    else if (dc3FoundBool)
    {
      planeIndex = 2;
    }
    else if (boeingFoundBool)
    {
      planeIndex = 4;
    }
    finalAudioIndex = langIndex + planeIndex;
    Patches.inputs.setScalar('finalAudioIndex', finalAudioIndex);
    Diagnostics.log('Total: ' + finalAudioIndex);
  }

  function resetAudio()
  {
    if (!wrightFoundBool && !dc3FoundBool && !boeingFoundBool) return;
    Patches.inputs.setPulse('resetAudio', Reactive.once());
  }

  const languageIndex = await Patches.outputs.getScalar('languageIndex').then(event => 
  {
    event.monitor().subscribe
    (
      function (values) 
      {
        Diagnostics.log('Lang: ' + values);
        langIndex = values.newValue;
        sumItUp();
        if (!wrightFoundBool && !dc3FoundBool && !boeingFoundBool) return;
        resetAudio();
      }
    )
  });
  const wrightFound = await Patches.outputs.getBoolean('wrightFound').then(event => 
    {
      event.monitor().subscribe
      (
        function (values) 
        {
          wrightFoundBool = values.newValue;
          Diagnostics.log('Wright Found: ' + values.newValue);
          sumItUp();
          resetAudio();
        }
      )
    });
  const dc3Found = await Patches.outputs.getBoolean('dc3Found').then(event => 
    {
      event.monitor().subscribe
      (
        function (values) 
        {
          dc3FoundBool = values.newValue;
          Diagnostics.log('DC3 Found: ' + values.newValue);
          sumItUp();
          resetAudio();
        }
      )
    });
    const boeingFound = await Patches.outputs.getBoolean('boeingFound').then(event => 
      {
        event.monitor().subscribe
        (
          function (values) 
          {
            boeingFoundBool = values.newValue;
            Diagnostics.log('Boeing Found: ' + values.newValue);
            sumItUp();
            resetAudio();
          }
        )
      });
})();
