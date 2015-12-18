function recommend(msg) {
    console.log(msg);
    if (msg[userid]) {
        $('#foodrecommend').slideUp("slow", function () {
            var foods = msg[userid];
            var count = 1;
            for (var index = 0; count <= 5 && index < foods.length; index++) {
                if (foods[index] == curr_room) continue;
                $('#foodButton' + count).text(foods[index]);
                $('#foodButton' + count).show();
                count++;
            }
        });
        $('#foodrecommend').slideDown(2000);
    }
}
