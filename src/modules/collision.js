!function () {
    const methods = {
        pointInBox: function (x, y, box) {
            if (x < box.x) {
                return false;
            } else if (x > (box.x + box.width)) {
                return false;
            } else if (y < box.y) {
                return false;
            } else if (y > (box.y + box.height)) {
                return false;
            }
            return true;
        },
        boxCollision: function (box1, box2) {
            // console.log(box1)
            // console.log(box2)
            const x = box1.x + box1.width / 2.;
            const y = box1.y + box1.height / 2.;
            const outsideBox = {
                x: box2.x - box1.width / 2.,
                y: box2.y - box1.height / 2.,
                width: box2.width + box1.width,
                height: box2.height + box1.height,
            }
            // console.log('debug', box1, box2, pointInBox (x, y, outsideBox))
            return this.pointInBox(x, y, outsideBox)
        },
        collision: function (player1, player2, box) {
            const x_min = Math.min(player1.x, player2.x);
            const y_min = Math.min(player1.y, player2.y);
            const x_max = Math.max(player1.x + player1.width, player2.x + player2.width);
            const y_max = Math.max(player1.y + player1.height, player2.y + player2.height);

            const largerPlayer = {
                x: x_min,
                y: y_min,
                width: x_max - x_min,
                height: y_max - y_min,
            }
            // console.log(largerPlayer)
            return this.boxCollision(largerPlayer, box);
        }
    }
    module.export(methods, "/src/modules/collision.js");
}()