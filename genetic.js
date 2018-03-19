/***********************************************************************************
/* Genetic Algorithm implementation
/***********************************************************************************/
var GeneticAlgorithm = function(max_units, top_units){
	console.log("GeneticAlgorithm()");

	this.max_units = max_units; // max number of units in population
	this.top_units = top_units; // number of top units (winners) used for evolving population
	
	if (this.max_units < this.top_units) this.top_units = this.max_units;
	
	this.Population = []; // array of all units in current population
}

GeneticAlgorithm.prototype = {
	// resets genetic algorithm parameters
	reset : function(){
		this.iteration = 1;	// current iteration number (it is equal to the current population number)
		this.mutateRate = 0.2; // initial mutation rate
		
		this.best_population = 0; // the population number of the best unit
		this.best_fitness = 0;  // the fitness of the best unit
		this.best_score = 0;	// the score of the best unit ever
	},
	
	// creates a new population
	createPopulation : function(){
		console.log("createPopulation()");

		// clear any existing population
		this.Population.splice(0, this.Population.length);
		
		for (var i=0; i<this.max_units; i++){
			// create a new unit by generating a random Synaptic neural network
			var newUnit = new synaptic.Architect.Perceptron(3, 4, 3);
			
			// set additional parameters for the new unit
			newUnit.index = i;
			newUnit.fitness = 0;
			newUnit.score = 0;
			newUnit.isWinner = false;
			
			// add the new unit to the population 
			this.Population.push(newUnit);
		}
	},

	getLiveUnits: function() {
		var livePop = [];
		this.Population.forEach(function(unit) {
			if (unit.dead == null || unit.dead != 1) {
				livePop.push(unit)
			}
		})
		return livePop;
	},
	
	// activates the neural network of an unit from the population 
	// to calculate an output action according to the inputs
	activateBrain : function(car, track){		
		// create an array of all inputs
		var inputs = track;

		// calculate outputs by activating synaptic neural network of this car
		var outputs = this.Population[car.index].activate(inputs);

		car.pos = indexOfMax(outputs)
	},
	
	// evolves the population by performing selection, crossover and mutations on the units
	evolvePopulation : function(){
		// select the top units of the current population to get an array of winners
		// (they will be copied to the next population)
		var Winners = this.selection();

	
		// fill the rest of the next population with new units using crossover and mutation
		for (var i=this.top_units; i<this.max_units; i++){
			var parentA, parentB, offspring;
				
			if (i == this.top_units){
				// offspring is made by a crossover of two best winners
				parentA = Winners[0].toJSON();
				parentB = Winners[1].toJSON();
				offspring = this.crossOver(parentA, parentB);

			} else if (i < this.max_units-2){
				// offspring is made by a crossover of two random winners
				parentA = this.getRandomUnit(Winners).toJSON();
				parentB = this.getRandomUnit(Winners).toJSON();
				offspring = this.crossOver(parentA, parentB);
				
			} else {
				// offspring is a random winner
				offspring = this.getRandomUnit(Winners).toJSON();
			}

			// mutate the offspring
			offspring = this.mutation(offspring);
			
			// create a new unit using the neural network from the offspring
			var newUnit = synaptic.Network.fromJSON(offspring);
			newUnit.index = this.Population[i].index;
			newUnit.fitness = 0;
			newUnit.score = 0;
			newUnit.isWinner = false;
			
			// update population by changing the old unit with the new one
			this.Population[i] = newUnit;
		}
		
		
		// sort the units of the new population	in ascending order by their index
		this.Population.sort(function(unitA, unitB){
			return unitA.index - unitB.index;
		});
	},

	// selects the best units from the current population
	selection : function(){
		// sort the units of the current population	in descending order by their fitness
		var sortedPopulation = this.Population.sort(
			function(unitA, unitB){
				// console.log(unitA.fitness + " vs " + unitB.fitness)
				return unitB.fitness - unitA.fitness;
			}
		);
		
		// mark the top units as the winners!
		for (var i=0; i<this.top_units; i++) this.Population[i].isWinner = true;
		
		// return an array of the top units from the current population
		return sortedPopulation.slice(0, this.top_units);
	},
	
	// performs a single point crossover between two parents
	crossOver : function(parentA, parentB) {
		// get a cross over cutting point
		var cutPoint = this.random(0, parentA.neurons.length-1);
		
		// swap 'bias' information between both parents:
		// 1. left side to the crossover point is copied from one parent
		// 2. right side after the crossover point is copied from the second parent
		for (var i = cutPoint; i < parentA.neurons.length; i++){
			var biasFromParentA = parentA.neurons[i]['bias'];
			parentA.neurons[i]['bias'] = parentB.neurons[i]['bias'];
			parentB.neurons[i]['bias'] = biasFromParentA;
		}

		return this.random(0, 1) == 1 ? parentA : parentB;
	},
	
	// performs random mutations on the offspring
	mutation : function (offspring){
		// mutate some 'bias' information of the offspring neurons
		for (var i = 0; i < offspring.neurons.length; i++){
			offspring.neurons[i]['bias'] = this.mutate(offspring.neurons[i]['bias']);
		}
		
		// mutate some 'weights' information of the offspring connections
		for (var i = 0; i < offspring.connections.length; i++){
			offspring.connections[i]['weight'] = this.mutate(offspring.connections[i]['weight']);
		}
		
		return offspring;
	},
	
	// mutates a gene
	mutate : function (gene){
		if (Math.random() < this.mutateRate) {
			var mutateFactor = 1 + ((Math.random() - 0.5) * 3 + (Math.random() - 0.5));
			gene *= mutateFactor;
		}
		
		return gene;
	},
	
	random : function(min, max){
		return Math.floor(Math.random()*(max-min+1) + min);
	},
	
	getRandomUnit : function(array){
		return array[this.random(0, array.length-1)];
	},
	
	normalize : function(value, max){
		// clamp the value between its min/max limits
		if (value < -max) value = -max;
		else if (value > max) value = max;
		
		// normalize the clamped value
		return (value/max);
	}
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}