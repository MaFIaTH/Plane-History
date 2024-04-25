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
  var currentFoundArray = new Array(0);

  function sumItUp ()
  {
    var lastIndex = currentFoundArray[currentFoundArray.length - 1];
    if (wrightFoundBool && lastIndex == 0)
    {
      planeIndex = 0;   
    }
    else if (dc3FoundBool && lastIndex == 1) 
    {
      planeIndex = 2;
    }
    else if (boeingFoundBool && lastIndex == 2)
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

  function isPlaneFound()
  {
    if (wrightFoundBool || dc3FoundBool || boeingFoundBool)
    {
      Patches.inputs.setBoolean('planeFound', true);
      return;
    }
    Patches.inputs.setBoolean('planeFound', false);
  }

  function manageArray(found, index)
  {
    if (found == true && currentFoundArray.indexOf(index) == -1)
    {
      currentFoundArray.push(index);
      resetAudio();
    } 
    else if (found == false) 
    {
      var removeIndex = currentFoundArray.indexOf(index);
      if (index == currentFoundArray[currentFoundArray.length - 1]) resetAudio();
      if (removeIndex > -1)
        currentFoundArray.splice(removeIndex, 1);
    }
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
          manageArray(values.newValue, 0);
          isPlaneFound();
          sumItUp();
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
          manageArray(values.newValue, 1);        
          isPlaneFound();
          sumItUp();
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
            manageArray(values.newValue, 2);
            isPlaneFound();
            sumItUp();
          }
        )
      });
})();
