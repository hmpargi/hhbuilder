
var state = {
  input: {
    age: { value: 0, error: '' },
    rel: { value: '', error: '' },
    smoker: { value: false, error: '' }
  },
  form: {
    editted: 'You have editted your household.<br><strong>Please click "Submit" to save your changes.</strong>',
    saved: '<strong>Your changes have been saved.</strong> Thank you!<br>If you make any updates to your household, make sure to click "Submit" again.',
    failed: '<strong>Something has gone wrong, and we were unable to save your household information.</strong><br>Please try again. If this issue persists, please contact us at <a href="#">example@email.com</a>'
  },
  saved: { } // populated by saveInput()
};

var elems = {
  form: document.querySelector('.builder form'),
  saved: document.querySelector('.household'),
  debug: document.querySelector('.debug'),

  age: document.querySelector('input[name="age"]'),
  rel: document.querySelector('select[name="rel"]'),
  smoker: document.querySelector('input[name="smoker"]')
};

var ageError = document.createElement('span');
elems.age.parentNode.appendChild(ageError);

var relError = document.createElement('span');
elems.rel.parentNode.appendChild(relError);

var formStatus = document.createElement('p');
elems.form.appendChild(formStatus);

var messages = {
  age: elems.form.querySelector('input[name="age"] + span'),
  rel: elems.form.querySelector('select[name="rel"] + span'),
  // smoker checkbox doesn't need an error msg
  status: elems.form.querySelector('p')
};

var templates = {
  savedMember: function(id, age, rel, smoker){

    // create new list item
    var elem = document.createElement('li');
    elem.setAttribute('id', id);

    // modify smoker info for friendlier display
    if(smoker === true)
      smoker = "smoker";
    else
      smoker = "non-smoker";

    // add family member info
    elem.innerHTML = rel + ' - ' + age + ' years old, ' + smoker;

    // add remove button
    var button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('value', 'Remove');

    // add event listener for remove button
    button.addEventListener('click', function(){
      removeSaved(id);
    }, false);

    elem.appendChild(button);
    return elem;
  }
};

// To help me add/remove correct household members
function makeSequence(start){
  var i = start;
  return function(){ return i++; }
}

var generateId = makeSequence(0);

// Render error messages
function renderInputState() {
  messages.age.innerHTML = state.input.age.error;
  messages.rel.innerHTML = state.input.rel.error;
}

// Render household
function renderSavedState() {
  elems.saved.innerHTML = ''; // clearing

  for(var id in state.saved){
    var child = templates.savedMember(id, state.saved[id].age, state.saved[id].rel, state.saved[id].smoker);
    elems.saved.appendChild(child);
  }
}

// Saving new family member
function saveInput() {
  if(state.input.age.error || state.input.rel.error)
    return;

  state.saved[generateId()] = {
    age: state.input.age.value,
    rel: state.input.rel.value,
    smoker: state.input.smoker
  };
  renderSavedState();
}

// Removing family member
function removeSaved(id) {
  delete state.saved[id];
  renderSavedState();
}

// Listening for new family member
elems.form.querySelector('.add').addEventListener('click', function(e){
  e.preventDefault();

  var age = parseFloat(elems.age.value); // parseFloat has better validation than parseInt
  var rel = elems.rel.options[elems.rel.selectedIndex].value;
  var smoker = elems.smoker.checked;
  state.input.smoker = smoker;

  if(isNaN(age) || age <= 0){
    state.input.age.error = 'Please enter a valid age.';
  }
  else {
    state.input.age.error = '';
    state.input.age.value = age;
  }

  if(rel === ''){
    state.input.rel.error = 'Please select a relationship.';
  }
  else {
    state.input.rel.error = '';
    state.input.rel.value = rel;
  }

  // Update error messages
  renderInputState();

  // Add new family member if there are no errors
  if(!state.input.age.error && !state.input.rel.error) {
    messages.status.innerHTML = state.form.editted;
    saveInput();
  }

  return false;
}, false);

// Submitting the whole household
elems.form.querySelector('button[type="submit"]').addEventListener('click', function(e){
  e.preventDefault();

  // Would post the JSON to a hypothetical server
  var request = new XMLHttpRequest();
  var data = JSON.stringify(state.saved);
  request.open('POST', '/', true);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  request.send(data);

  /*

  // Although this POST isn't really going to a server,
  // here's how success/failure messaging would work.
  // (to see in action, uncomment this section + comment out line 244 that just displays state.form.saved outright)

  request.onreadystatechange = function () {
    var ready = 4;
    var success = 200;
    if (request.readyState === ready) {
      if (request.status === success) {
        messages.status.innerHTML = state.form.saved;
      }
      else {
        messages.status.innerHTML = state.form.failed;
      }
    }
  };

  */

  messages.status.innerHTML = state.form.saved;

  document.querySelector(".debug").style="display:block";
  elems.debug.innerHTML = JSON.stringify(state.saved, null, 2);
});
