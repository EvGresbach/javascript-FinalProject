$(document).ready(function () {
    //backpack stuff
    $("img#backpackImg").click(toggleBackpackContents);
    function toggleBackpackContents (){
        $("#backpackContents").toggle();
    }
    //pick up any image item, add it to the backpack, and then print out the new array
    $("body").on("click", "img.itemToPickUp", function(){
        $(this).toggle();
        var item = $(this).attr("id");
        for (var i=0; i < gameItems.length; i++)
        {
            if(item === gameItems[i].itemImg)
            {
                backpack.push(i);
                var p = $("<p>").html(`Item picked up:
                    ${gameItems[i].itemType}<br>${gameItems[i].itemName} - ${gameItems[i].itemDesc}`);
                break;
            }
        }
        updateBackpack();
        $("#gameMessages").append(p);
    });

    //click on any of the backpack's items to equip/use
    $("#backpackContents").on("click", "img.itemToEquip", function(){
        //get the item id to find the index in our gameItems array to use for outputing
        var item = $(this).attr("id");
        var index;
        for (var i=0; i <gameItems.length; i++)
        {
            if(item === gameItems[i].itemImg)
            {
                index = i; //gives index from the gameItems array
                break;
            }
        }

        var itemClass = $(this).attr("class");
        var itemClass = itemClass.slice(12, itemClass.length);
        switch(itemClass){
            case "Weapon":
                replaceWeapon(index, item);
                break;
            case "Armor":
                replaceArmor(index, item);
                break;
            case "Special_Item":
                useSpecItem();
                break;
            case "Potion":
                useHealthPotion(index);
        }
        // makes sure armor and weapon equipped at very begging to properly attack/take damage
        if(player.maxHealth >= 10 && player.maxStrength>= 5)
        {
            $("#intro-pt4-button").toggle();
        }


        function replaceWeapon(index, item){
            $("#currentWeapon").text(gameItems[index].itemName);
            $("#currentWeaponDiv").empty();
            // create an image to put there
            var img = $("<img>");
            img.attr("src", `images/${item}.png`);
            $("#currentWeaponDiv").append(img);

            //remove it from the backpack
            for(var i = 0; i < backpack.length; i++){
                if (index === backpack[i])
                {
                    backpack.splice(i,1);
                    break;
                }
            }
            //increase strength
            player.minStrength += gameItems[index].minStrength;
            player.maxStrength += gameItems[index].maxStrength;
            $("#playerStrengthDisplay").text(`${player.minStrength} - ${player.maxStrength}`);
            updateBackpack();
        }

        function replaceArmor(index, item){
            $("#currentArmor").text(gameItems[index].itemName);
            $("#currentArmorDiv").empty();
            // create an image to put there
            var img = $("<img>");
            img.attr("src", `images/${item}.png`);
            $("#currentArmorDiv").append(img);

            //remove it from the backpack
            for(var i = 0; i < backpack.length; i++){
                if (index === backpack[i])
                {
                    backpack.splice(i,1);
                    break;
                }
            }
            //increase health
            player.maxHealth += gameItems[index].health;
            player.currentHealth += gameItems[index].health;
            $("#playerHealthDisplay").text(`${player.currentHealth}/${player.maxHealth}`);
            updateBackpack();
        }
        function useSpecItem () {}
        function useHealthPotion(index){
            //if health is less than max, add health
            if(player.currentHealth < player.maxHealth)
            {
                //add health (max * 10%) and if current health > max, set current to max
                player.currentHealth += gameItems[index].health * player.maxHealth;
                if (player.currentHealth > player.maxHealth)
                {
                    player.currentHealth = player.maxHealth;
                }
                // remove from backpack
                for(var i = 0; i < backpack.length; i++){
                    if (index === backpack[i])
                    {
                        backpack.splice(i,1);
                        break;
                    }
                }
                updateBackpack();
                //display the new health
                $("#playerHealthDisplay").text(`${player.currentHealth}/${player.maxHealth}`);
            }
            else
            {
                var p = $("<p>").text("Health potions cannot be used at max health");
                $("#gameMessages").append(p);
            }


        }

    })
    function updateBackpack (){
        //clear out so we don't have duplicate images
        $("#backpackContents").empty();
        for (var i=0; i < backpack.length; i++)
        {
            //display items in backpack
            var img = $("<img>");
            img.attr("src", `images/${gameItems[backpack[i]].itemImg}.png`)
                .attr("class", `itemToEquip ${gameItems[backpack[i]].itemType}`)
                .attr("id", gameItems[backpack[i]].itemImg);
            $("#backpackContents").append(img);
        }
    }


    //attacking!!!
    $("div").on("click", "img.enemy", function (event){
        // to prevent code from running multiple times
        event.stopImmediatePropagation();


        // grab the id and figure out the array and index we need
        var enemy = $(this).attr("id");
        var enemyType = enemy.slice(0, enemy.length - 1);
        var enemyNum = enemy.slice(enemy.length - 1) - 1;
        var enemyCurrentHealth;
        var enemyMaxHealth;
        var enemyMaxStrength;
        var enemyMinStrength;

        //player attack
        // set up all enemy stuff so we don't have to keep finding them
        switch(enemyType){
            case "bushes":
                enemyMaxStrength = bushes[enemyNum].maxStrength;
                enemyMinStrength = bushes[enemyNum].minStrength;

                // player attack
                bushes[enemyNum].currentHealth -= randomAttack(player.minStrength, player.maxStrength);
                enemyCurrentHealth = bushes[enemyNum].currentHealth;
                enemyMaxHealth = bushes[enemyNum].maxHealth;
                break;
            case "royalSpirits":
                enemyMaxStrength = royalSpirits[enemyNum].maxStrength;
                enemyMinStrength = royalSpirits[enemyNum].minStrength;
                royalSpirits[enemyNum].currentHealth -= randomAttack(player.minStrength, player.maxStrength);
                enemyCurrentHealth = royalSpirits[enemyNum].currentHealth;
                enemyMaxHealth = royalSpirits[enemyNum].maxHealth;
                break;
            case "newbloods":
                enemyMaxStrength = newbloods[enemyNum].maxStrength;
                enemyMinStrength = newbloods[enemyNum].minStrength;
                newbloods[enemyNum].currentHealth -= randomAttack(player.minStrength, player.maxStrength);
                enemyCurrentHealth = newbloods[enemyNum].currentHealth;
                enemyMaxHealth = newbloods[enemyNum].maxHealth;
                break;
        }
        $(`#${enemy}Display`).text(`${enemyCurrentHealth}/${enemyMaxHealth}`);


        //if enemy is alive, they attack player. if not, they get removed
        if(enemyCurrentHealth > 0){
            player.currentHealth -= randomAttack(enemyMinStrength, enemyMaxStrength);
            $("#playerHealthDisplay").text(`${player.currentHealth}/${player.maxHealth}`);
        }
        else {
            $(this).remove();
            $(`#${enemy}Display`).parent().remove();
        }

        //if player is dead show a game over
        if (player.currentHealth <= 0){
            //GAMEOVER
            $(this).parent().toggle();
            $("#gameOver").toggle();
        }
        //if all enemies of a type are dead, the round is over
        switch(enemyType){
            case "bushes":
                if (bushes[0].currentHealth <= 0 && bushes[1].currentHealth <= 0){
                    $("#intro-pt5-button").toggle();
                }
                break;
            case "royalSpirits":
                if (royalSpirits[0].currentHealth <= 0 && royalSpirits[1].currentHealth <= 0 && royalSpirits[2].currentHealth <= 0 &&
                    royalSpirits[3].currentHealth <=0){
                    var imgWP = $("<img>").attr("src", `images/phantom_weapon_${player.class}.png`).attr("class", "itemToPickUp");
                    var imgPP = $("<img id='health_potion' class='itemToPickUp' src='images/health_potion.png' alt='Health potion'>");
                    var imgPP2 = $("<img id='health_potion' class='itemToPickUp' src='images/health_potion.png' alt='Health potion'>");
                    var imgPP3 = $("<img id='health_potion' class='itemToPickUp' src='images/health_potion.png' alt='Health potion'>");
                    $("#docks-items").append(imgPP).append(imgPP2).append(imgPP3);
                    $("#phantom_armor").after(imgWP);
                    $("#docks-items").toggle()
                }
                else if (royalSpirits[0].currentHealth <= 0 && royalSpirits[1].currentHealth <= 0 && royalSpirits[2].currentHealth <= 0){
                    var img = $("<img id='health_potion' class='itemToPickUp' src='images/health_potion.png' alt='Health potion'>");
                    var img2 = $("<img id='health_potion' class='itemToPickUp' src='images/health_potion.png' alt='Health potion'>");
                    var img3 = $("<img id='health_potion' class='itemToPickUp' src='images/health_potion.png' alt='Health potion'>");
                    $("#docks-pt3-fightOver").append(img).append(img2).append(img3);
                    $("#docks-pt3-fightOver").toggle();
                    $("#docks-pt3-button").toggle();
                }
                break;
            case "newbloods":
                if (newbloods[0].currentHealth <= 0 && newbloods[1].currentHealth <= 0 && newbloods[2].currentHealth <= 0 &&
                    newbloods[3].currentHealth <=0){
                    $("#abandonedSector-bossfight").toggle();
                    $("#gameFinished").toggle();
                }
                else if (newbloods[0].currentHealth <= 0 && newbloods[1].currentHealth <= 0 && newbloods[2].currentHealth <= 0){
                    var imgN = $("<img id='health_potion' class='itemToPickUp' src='images/health_potion.png' alt='Health potion'>");
                    var imgN2 = $("<img id='health_potion' class='itemToPickUp' src='images/health_potion.png' alt='Health potion'>");
                    var imgN3 = $("<img id='health_potion' class='itemToPickUp' src='images/health_potion.png' alt='Health potion'>");
                    $("#abandonedSector-pt4").append(imgN).append(imgN2).append(imgN3);
                    $("#abandonedSector-pt3").toggle();
                    $("#abandonedSector-pt4").toggle();
                }
                break;
        }
    });

    function randomAttack(min, max){
        var random =  Math.floor(Math.random() * (max - min + 1) + min);
        return random;
    }

    //start game button
    $("#startGameButton").click({current: "ready", next: "intro-name"}, openNextArea);

    //Backpack array, backpack will be an array of objects w/ class, item name, item type, item img, item desc, and area it's found
    var backpack = [];

    var gameItems = [
        {area: "intro", class: "all", itemName: "Diamond Necklace", itemType: "Special Item",
            itemImg: "diamond_necklace", itemDesc: "A diamond necklace that belonged to someone from the Phantom's past."},
        {area: "all", class: "all", itemName: "Health Potion", itemType: "Potion", health: .10,
            itemImg: "health_potion", itemDesc: "A small potion that heals 10% of your maximum health"},

        {area: "intro", class: "all", itemName: "Basic Armor", itemType: "Armor", health: 10,
            itemImg: "basic_armor", itemDesc: "A leather tunic to give you protection. +10 Health when equipped"},
        {area: "intro", class: "Assassin", itemName: "Basic Dagger", itemType: "Weapon", minStrength: 5, maxStrength: 5,
            itemImg: "basic_weapon_assassin", itemDesc: "A dagger to help you defeat your enemies. +5 Strength when equipped"},
        {area: "intro", class: "Mage", itemName: "Basic Staff", itemType: "Weapon", minStrength: 5, maxStrength: 5,
            itemImg: "basic_weapon_mage", itemDesc: "A staff to help you defeat your enemies. +5 Strength when equipped"},

        {area: "docks", class: "all", itemName:"Phantom Armor", itemType:"Armor", health: 10,
            itemImg: "phantom_armor", itemDesc: "Armor from Phantom. +10 Health when equipped"},
        {area: "docks", class: "Assassin", itemName:"Phantom Weapon", itemType:"Weapon", minStrength: 3, maxStrength: 5,
            itemImg: "phantom_weapon_assassin", itemDesc: "A weapon from Phantom. +3-5 Strength when equipped"},
        {area: "docks", class: "Mage", itemName:"Phantom Weapon", itemType:"Weapon", minStrength: 3, maxStrength: 5,
            itemImg: "phantom_weapon_mage", itemDesc: "A staff from Phantom. +3-5 Strength when equipped"},
        {area: "docks", class: "all", itemName:"Book", itemType:"Special Item",
            itemImg: "book", itemDesc: "A small book with a page marked."}
    ]

    //hero object
    var player = {
        maxHealth: 0,
        currentHealth: 0,
        minStrength: 0,
        maxStrength: 0
    };

    // validation for name
    var myRules = {
        playerName: {
            required: true
        }
    }
    var myMessages = {
        playerName: {
            required: "Hey, adventurer, you have to have a name"
        }
    }

    $("form#submitName").validate({
        submitHandler: setPlayerName,
        rules: myRules,
        messages: myMessages
    })

    //tutorial enemies
    var bushes = [
        {
            name: "Bush 1",
            maxHealth: 5,
            currentHealth: 5,
            minStrength: 1,
            maxStrength: 1
        },
        {
            name: "Bush 2",
            maxHealth: 5,
            currentHealth: 5,
            minStrength: 1,
            maxStrength: 1
        }
    ]
    // area one enemies
    var royalSpirits = [
        {
            name: "Shadow",
            maxHealth: 10,
            currentHealth: 10,
            minStrength: 1,
            maxStrength: 3
        },
        {
            name: "Vision",
            maxHealth: 10,
            currentHealth: 10,
            minStrength: 1,
            maxStrength: 3
        },
        {
            name: "Shade",
            maxHealth: 10,
            currentHealth: 10,
            minStrength: 1,
            maxStrength: 3
        },
        {
            name: "Phantom",
            maxHealth: 20,
            currentHealth: 20,
            minStrength: 2,
            maxStrength: 5
        }
        ];

    var newbloods = [
        {
            name: "Z",
            maxHealth: 20,
            currentHealth: 20,
            minStrength: 6,
            maxStrength: 8
        },
        {
            name: "Viper",
            maxHealth: 20,
            currentHealth: 20,
            minStrength: 6,
            maxStrength: 8
        },
        {
            name: "Electra",
            maxHealth: 20,
            currentHealth: 20,
            minStrength: 6,
            maxStrength: 8
        },
        {
            name: "Blue Lightning",
            maxHealth: 30,
            currentHealth: 30,
            minStrength: 9,
            maxStrength: 12
        }
    ]

    //intro buttons -- give it the div it's in, the div to open, and the function to toggle them
    $("#intro-pt1-button").click({current: "intro-pt1", next: "intro-pt2"}, openNextArea);
    $("#intro-pt2-yes").click({current: "intro-pt2", next: "intro-pt3"}, openNextArea);
    $("#intro-pt2-weirdo").click({current: "intro-pt2", next: "intro-weirdo-pt1"}, openNextArea);
    $("#intro-weirdo-pt1-whatever").click({current: "intro-weirdo-pt1", next: "intro-pt3"}, openNextArea);
    $("#intro-weirdo-pt1-youAre").click({current: "intro-weirdo-pt1", next: "intro-weirdo-pt2"}, openNextArea);
    $("#intro-weirdo-pt2-yes").click({current: "intro-weirdo-pt2", next: "intro-pt3"}, openNextArea);
    $("#intro-weirdo-pt2-no").click({current: "intro-weirdo-pt2", next: "intro-weirdo-SpecItem"}, openNextArea);
    $("#intro-weirdo-SpecItem-button").click({current: "intro-weirdo-SpecItem", next: "intro-pt3"}, openNextArea)
    $("#intro-pt3 input[name=playerClass]").hover(
        function (){ //mouse enter function to show the class descriptions
            var classDisplay = $(this).val();
            $("#classInfo-className").text(classDisplay);
            switch(classDisplay)
            {
                case "Mage":
                    $("#classInfo-description").text("Sharp and strong, a ranged fighter who uses strength and smarts to " +
                        "defeat their enemies. +5 Starting Strength")
                        .after("<img src='images/Mage.png' alt='Pixel Mage'>");
                    break;
                case "Assassin":
                    $("#classInfo-description").text("Swift and sure, a melee fighter who uses their wits and agility to " +
                        "defeat their enemies. +5 Starting Health.")
                        .after("<img src='images/Assassin.png' alt='Pixel Assassin'>");
                    break;
            }

            $("#intro-pt3-classInfo").toggle();
        },
        function (){ //mouse exit to close the descriptions
            $("#intro-pt3-classInfo img").remove();
            $("#intro-pt3-classInfo").toggle();
        }
    );
    $("#intro-pt3 button").click(setPlayerClass);
    $("#intro-pt4 button").click({current: "intro-pt4", next: "intro-pt5"}, openNextArea);
    $("#intro-pt5-button").click({current: "intro-pt5", next: "intro-pt6"}, openNextArea);
    $("#intro-pt6-button").click({current: "intro-pt6", next: "intro-pt7"}, openNextArea);
    $("#intro-pt7-button").click({current: "intro-pt7", next: "docks-pt1"}, openNextArea);

    //area 2 buttons
    $("#docks-pt1-button").click(function() {
        //change color scheme of page
        $("header h1").css("background-color", "#502989");
        $("nav").css("background-color", "#9570dd");
        $("nav a").css("color", "white");
        $("#left").css("background-color", "#f0eafa");
        $("#right").css("background-color", "#f0eafa");
        $("#gameMessages").empty();

        //toggle divs
        $("#docks-pt1").toggle();
        $("#docks-pt2").toggle();
    });
    $("#docks-pt2-button").click({current: "docks-pt2", next: "docks-pt3"}, openNextArea);
    $("#docks-pt3-button").click(function(){
        $("#docks-pt3").toggle();
        $("#docks-pt4").toggle();
        //if the backpack include 0 (index of the first special item) show the text/options for it
        if(backpack.includes(0)){
            $("#docks-useSpecItem").toggle();
            $("#docks-pt4-button-specItem").toggle();
        }
    });
    $("#docks-pt4-button-normal").click({current: "docks-pt4", next: "docks-bossfight"}, openNextArea);
    $("#docks-pt4-button-specItem").click({current: "docks-pt4", next: "docks-pt5"}, openNextArea);
    $("#docks-pt5-button-yes").click({current: "docks-pt5", next: "docks-pt6-yes"}, openNextArea);
    $("#docks-pt5-button-no").click({current: "docks-pt5", next: "docks-pt6-no"}, openNextArea);
    $("#docks-pt5-button-idk").click({current: "docks-pt5", next: "docks-pt6-idk"}, openNextArea);
    $("#docks-pt6-button-fight").click(function(){
        //anger boss
        royalSpirits[3].currentHealth += 5;
        royalSpirits[3].maxHealth += 5;
        $("#docks-pt6").toggle();
        $("#docks-bossfight").toggle();
    });
    $("#docks-pt6-button-fight2").click({current: "docks-pt6", next: "docks-bossfight"}, openNextArea);
    $("#docks-pt6-button-tell").click({current: "docks-pt6-idk", next: "docks-pt7-tell"}, openNextArea);
    $("#docks-pt6-button-dontTell").click({current: "docks-pt6-idk", next: "docks-pt7-dontTell"}, openNextArea);
    $("#docks-pt7-tell-button").click(function() {
        //close docks 7
        $("#docks-pt7-tell").toggle();
        // add class weapon to items
        var imgLW = $("<img>").attr("src", `images/phantom_weapon_${player.class}.png`).attr("class", "itemToPickUp");
        $("#docks-items").append(imgLW)
        // open items
        $("#docks-items").toggle()
    })
    $("#docks-items-button").click({current: "docks", next: "abandonedSector-pt1"}, openNextArea)

    //area 3 buttons
    $("#abandonedSector-pt1-button").click(function() {
        //change color scheme of page
        $("header h1").css("background-color", "#096484");
        $("nav").css("background-color", "#4796b3");
        $("nav a").css("color", "white");
        $("#left").css("background-color", "#74b6ce");
        $("#right").css("background-color", "#74b6ce");
        $("#gameMessages").empty();

        //toggle divs
        $("#abandonedSector-pt1").toggle();
        $("#abandonedSector-pt2").toggle();

    });
    $("#abandonedSector-pt2-button").click({current: "abandonedSector-pt2", next: "abandonedSector-pt3"}, openNextArea);
    $("#abandonedSector-pt4-button-danger").click(function() {
        //anger boss
        newbloods[3].minStrength += 5;
        newbloods[3].maxStrength += 5;
        $("#abandonedSector-pt4").toggle();
        $("#abandonedSector-bossfight").toggle();
    });
    $("#abandonedSector-pt4-button-safe").click({current: "abandonedSector-pt4", next: "abandonedSector-pt5"}, openNextArea);
    $("#abandonedSector-pt5-button-little").click({current: "abandonedSector-pt5", next: "abandonedSector-bossfight"}, openNextArea);
    $("#abandonedSector-pt5-button-blue").click({current: "abandonedSector-pt5", next: "abandonedSector-pt6"}, openNextArea);
    $("#abandonedSector-pt6-button-normal").click({current: "abandonedSector-pt6", next: "abandonedSector-pt7-normal"}, openNextArea)
    $("#abandonedSector-pt6-button-specIt").click({current: "abandonedSector-pt6", next: "abandonedSector-pt7-specIt"}, openNextArea);
    $("#abandonedSector-pt7-normal-button").click({current: "abandonedSector-pt7-normal", next: "gameFinished"}, openNextArea);
    $("#abandonedSector-pt7-specIt").click({current: "abandonedSector-pt7-specIt", next: "gameFinished"}, openNextArea);



    //functions
    function setPlayerName()
    {
        //get player name and display it in the game
        player.name = $("#playerName").val();
        $(".playerNameDisplay").text(player.name);
        $("#intro-name").toggle();
        $("#intro-pt1").toggle();
    }

    function setPlayerClass()
    {
        player.class = $("input[name=playerClass]:checked").val();
        //set the weapon image to match player class
        switch(player.class)
        {
            case "Mage":
                var alt = "Basic Staff";
                var id = "basic_weapon_mage";
                player.maxStrength += 5;
                player.minStrength += 5;
                break;
            case "Assassin":
                var alt = "Basic Dagger";
                var id = "basic_weapon_assassin";
                player.maxHealth += 5;
                player.currentHealth += 5;
                break;
        }
        var image = $("<img>");
        image.attr("src", `images/basic_weapon_${player.class}.png`).attr("class", "itemToPickUp")
            .attr("alt", alt)
            .attr("class", "itemToPickUp weapon").attr("id", id);

        $("#playerClassDisplay").text(player.class);
        var p = $("<p>").text(`You are part of the ${player.class} class`);
        $("#gameMessages").append(p);
        $("#intro-pt4 img").after(image);
        $("#intro-pt3").toggle();
        $("#intro-pt4").toggle()

    }
    function openNextArea (event)
    {
        var next = event.data.next;

        $(`#${event.data.current}`).toggle();
        $(`#${next}`).toggle();
    }

});