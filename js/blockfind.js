/*
 * overlapping_blocks - find blocks in a bbox_index that
 *                      overlap with a given bottom left
 *                      and top right position
 *
 *     args: bbox_index - in the format that mapshaper
 *                        outputs from split-to-grid
 *                   bl - bottom left coord
 *                   tr - top right coord
 *           
 *     rets: returns a filtered copy of bbox_index
 */
var overlapping_blocks = function(bbox_index, bl, tr)
{

    var b_left = bl[0];
    var b_top = tr[1];
    var b_right = tr[0];
    var b_bottom = bl[1];

    return bbox_index.filter(function(a){

	var a_left = a.bbox[0];
	var a_bottom = a.bbox[1];
	var a_right = a.bbox[2];
	var a_top = a.bbox[3];
	
	if ( a_right < b_left ) return false;
	if ( a_left > b_right ) return false;
	if ( a_top < b_bottom ) return false;
	if ( a_bottom > b_top ) return false;

	return true;
    });
    
}

exports.overlapping_blocks = overlapping_blocks;
