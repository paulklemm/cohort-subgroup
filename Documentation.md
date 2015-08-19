Visual Analysis of Cohort Study Data  
====================================

####This interface is used for intuitively and effectively filtering a given dataset consisting of about 300 attributes for each participant to create proband subgroups that can then be analyzed using a method of choice.

-----------------

File system
===========

###index.html  
This is the default web page that is displayed when entering the URL.  
It is used to structure the interface by arranging the individual components within a grid layout. The components themselves are stored externally in directives (to be found in app/directives) and are just called within the index file.

###app.js  
TODO  
- is executed at the beginning
- load initial data: the proband dataset, the list of attributes including details and type, the list of attributes sorted into categories
- initialize the list of subgroups for filtering with the complete dataset as well as set the initially selected subgroup to this group
- set a list of attributes containing the distribution and type for each attribute
- controller for displaying context information according to selected attribute

###app  
This folder contains the directives and services that control the data management as well as the individual components.

###data  
This folder contains the data basis for the user interface. This includes the proband data as well as details and structuring of the attributes.  
*attributes.json*:
This file contains all attributes sorted into 12 categories and is used for the visualization as described in 'List of Attributes'.  
*dictionary_new_names.json*:  
This file contains a short description and the type (e.g. nominal, ordinal, ...) for each attribute. These information are needed for displaying the distribution of an attribute according to its type via barchart or graph.  
*breast_fat_labels.csv*:  
This file holds the full dataset of probands consisting of ?.

###bower_components
This folder contains all required files for the used libraries.

###assets
This folder contains additional files such as css files and js files.  
*css*:  
The css files are organized by components. Each folder contains the css file that controls the style of the specific component.  
The main.css is the main stylesheet for the user interface. It holds all the values for the overall layout and arrangement of the components.  
*js*:  
This folder contains the js file for the tooltips used for filter elements. It holds a constructor as well as functions for showing, hiding, removing and manipulating tooltips in terms of attributes, style, direction, offset and content.

-----------------

Libraries
=========
###AngularJS
This web application framework is used to organize the code according to the model-view-controller architecture and therefore support the development of the user interface.
###Bootstrap  
This front-end framework supports responsive as well as fast and easy web development and provides various custom HTML and CSS components. It is used for keeping the layout simple and applicable to various devices of different shapes.
###D3  
This JavaScript library helps manipulating documents based on data. It combines powerful visualization components with a data-driven approach to DOM manipulation and therefore is used for simply visualizing the given proband data of the study.

-----------------

Components
==========
###Dataservice (services/data.service.js)  
This class organizes the data, traces current states and provides functions to do calculations  and filter processes on the data as well as exporting the created subgroups.  


Member variables:  
*dataset*  
*subgroups*  
*selectedSub*  
*attributes*  
*currentAttribute*  
*jsondata*  
*visdata*  

Member functions:  
*setCurrentAttribute*  
*setAttributes*  
*filterToCSV*  
*calcDistribution*  
*getCSVString*  
*saveSubgroup*  
*getIndex*  
*alreadyUsed*  
*findNeigh*  
*findDown*  
*uniq_fast*

###Barchart (directives/barchart.directive.js)  
This directive creates a barchart visualizing the distribution of a not continuous attribute as soon as such an attribute is selected.  
Filtering can be done by selecting single/multiple bars via mouseclick or selection frame and hitting the button "Apply filter". This creates a new subgroup with probands that fulfill the chosen criteria.
If one or more subgroups have already been created then the bars are subdivided showing the initial distribution (blue) as well as the distribution within the selected subgroup (grey).

###Graph (directives/graph.directive.js)  
This directive creates a line graph visualizing the distribution of a continous attribute as soon as such an attribute is selected.

###Filterbar (directives/filterbar.directive.js)  
This directive shows the history of filter processes.  
For each filtering process a new subgroup is created and visualized in terms of a filter element. Filter processes can be triggered out of every element, resulting in a new subgroup created out of the subgroup represented by the selected element. The arrangement of these elements reflects the course of filtering by means of connecting lines and position.  
A selected subgroup in the filterbar can be saved to the computer by clicking the disk button.

###Progressbar (directives/progressbar.directive.js)  
This directive visualizes how many probands of the initial dataset are left in a subgroup. With each filtering the progressbar is updated showing the percentage of probands in the resulting subgroup compared to the number of probands in the initial dataset.  
Amongst others this prevents the user from creating subgroups with too few probands that are not statistically relevant.

###Searchbar (directives/searchbar.directive.js)  
This searchfield is used to search for a specific attribute whose context information can then be viewed or that can be used for filtering.  
The list of attributes is searched for the searchterm and suggests attributes that match the searchterm or contain it.

###List of Attributes (directives/tree.directive.js)  
Exploring the list of attributes and selecting one of them for further processing is possible using the tree layout.  
A preview of the attributes' distributions can be seen inside the tree layout via small multiples.

-----------------

Implementation
==============
###directives/tree.directive.js  
The tree layout was implemented using the Collapsible Tree of the D3 library.  
