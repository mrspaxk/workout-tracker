fetch('workouts.json')
 .then(response => response.json())
 .then(data => {
   const today = new Date(); // Current date: 2025-10-24 01:55 PM CDT
   const weekday = (today.getDay() + 6) % 7 + 1; // Adjust to WEEKDAY(Date, 2)
   const split = data.splits.find(s => s.id === weekday);
   const exercises = data.exercises.filter(e => e.split_id === weekday);

   document.getElementById('splitName').textContent = split.name;

   const exerciseForms = document.getElementById('exerciseForms');
   exercises.forEach(exercise => {
     const div = document.createElement('div');
     div.className = 'exercise';
     div.innerHTML = `<h2>${exercise.exercise}</h2>`;
     for (let set = 1; set <= exercise.sets; set++) {
       div.innerHTML += `
         <div class="set-row">
           <span>Set ${set}</span>
           <input type="number" id="reps_${exercise.exercise}_${set}" placeholder="Reps">
           <input type="number" id="weight_${exercise.exercise}_${set}" placeholder="Weight">
         </div>
       `;
     }
     exerciseForms.appendChild(div);
   });

   window.saveWorkout = function() {
     const workoutData = [];
     exercises.forEach(exercise => {
       for (let set = 1; set <= exercise.sets; set++) {
         const reps = document.getElementById(`reps_${exercise.exercise}_${set}`).value || 0;
         const weight = document.getElementById(`weight_${exercise.exercise}_${set}`).value || 0;
         workoutData.push({
           date: today.toISOString().split('T')[0],
           split: split.name,
           exercise: exercise.exercise,
           set: set,
           reps: reps,
           weight: weight
         });
       }
     });

     const headers = ['Date', 'Split', 'Exercise', 'Set', 'Reps', 'Weight'];
     const csv = [
       headers.join(','),
       ...workoutData.map(row => Object.values(row).join(','))
     ].join('\n');

     const blob = new Blob([csv], { type: 'text/csv' });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `workout_${today.toISOString().split('T')[0]}.csv`;
     a.click();
     window.URL.revokeObjectURL(url);

     // Reset form after save and download
     exercises.forEach(exercise => {
       for (let set = 1; set <= exercise.sets; set++) {
         document.getElementById(`reps_${exercise.exercise}_${set}`).value = '';
         document.getElementById(`weight_${exercise.exercise}_${set}`).value = '';
       }
     });
     document.getElementById('message').style.display = 'block';
     setTimeout(() => document.getElementById('message').style.display = 'none', 2000);
   };
 })
 .catch(error => console.error('Error loading JSON:', error));